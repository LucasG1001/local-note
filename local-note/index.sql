USE [ConforceBI]
GO
/****** Object:  StoredProcedure [AMBEV-JUATUBA].[Sp_Telemetry]    Script Date: 10/12/2025 10:59:17 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER procedure [AMBEV-JUATUBA].[Sp_Telemetry]
  @pInitialDate datetime,
  @pFinalDate datetime

as
begin
  set nocount on;

  begin try
    begin transaction
    declare
      @ElectricForkliftName      varchar(30) = 'ELÉTRICAS',
      @AreaNameDefault           varchar(5)  = 'Ambev',
      @AreaNotIdentified         varchar(16) = 'Não identificado',
      @EventDefault              varchar(6)  = 'Normal',
      @ActiveDriver              bit         = 1,
      @IdleEngineName            varchar(30) = 'Motor Ocioso',
      @EngineOn                  varchar(30) = 'Motor Ligado',
      @ShiftInMinute             int,
      @FirstShiftName            varchar(30) = '1º Turno',
      @SecondShiftName           varchar(30) = '2º Turno',
      @ThirdShiftTempName        varchar(30) = '3º Turno h',
      @ThirdShiftName            varchar(30) = '3º Turno',
      @Contaid                   int         = 216,
      @TotalTimeByShift          int         = 0,
      @TotalOffByShift           int         = 0,
      @TotalEffectiveTimeByShift int         = 0,
      @TotalIdleTimeByShift      int         = 0,
      @CurrentDateString         varchar(30),
      @Grupo                     varchar(60),
      @InitialDate               datetime,
      @VeiculoId                 int,
      @LicensePlate              varchar(60),
      @Category                  varchar(60),
      @Ignicao                   bit,
      @Distancia                 float,
      @AvaregeSpeed              int,
      @MaxSpeed                  int,
      @Latitude                  float,
      @Longitude                 float,
      @PreviousDate              datetime,
      @CurrentDate               datetime,
      @CurrentAreaName           varchar(60),
      @CurrentDriverName         varchar(60),
      @CurrentShiftName          varchar(15),
      @CurrentDriverId           varchar(20),
      @CurrentTotalTime          int,
      @CurrentEvent              varchar(40),
      @CurrentEventName          varchar(30),
      @InitialDateEvent          datetime,
      @InitialAreaName           varchar(60),
      @InitialDriverId           varchar(20),
      @EventStartControl         bit,
      @TotalTimeEvent            int,
      @InitialSpeedRange         varchar(30),
      @ChargingAreaName          varchar(30),
      @WorkshopAreaName          varchar(30),
      @SpeedRangeRedName         varchar(19),
      @EngineOffName             varchar(30),
      @StartThirdShift           datetime,
      @EndThirdShift             datetime,
      @StartFirstShift           datetime,
      @EndFirstShift             datetime,
      @StartSecondShift          datetime,
      @EndSecondShift            datetime,
      @CurrentShiftStartDate     datetime,
      @CurrentShiftFinalDate     datetime,
      @LatLongList               geography,
      @CurrentDriverEventId      int,
      @IdTempTurno               int,
      @FirstShiftInMinute        int,
      @SecondShiftInMinute       int,
      @ThirdShiftInMinute        int,
      @LatitudeAnterior          float,
      @LongitudeAnterior         float,
      @Data                      datetime,
      @NextData                  datetime,
      @IgnicaoOnOff              char(1),
      @PreviousIgnicaoOnOff      char(1),
      @ReOnOff                   char(1),
      @PreviousReOnOff           char(1),
      @OciosoIniFim              char(1),
      @PreviousOciosoIniFim      char(1),
      @Horario                   varchar(50),
      @Shift                     varchar(20),

      @TvTelemetria           as [AMBEV-JUATUBA].[Tp_Telemetria],
      @TvTelemetriaMotorista  as [AMBEV-JUATUBA].[Tp_TelemetriaMotorista],
      @TvTelemetriaLatlong    as [AMBEV-JUATUBA].[Tp_TelemetriaMotoristaEvento];

      declare @TvNewTelemetriaId
      table (
             TelemetriaId int
            ,TelemetriaIdTemp int
           );

      declare @turno as table
      (
        Ordem int,
        Inicio datetime,
        Fim datetime
      );

       select @Horario = case
                          when @pInitialDate >= '2025-01-01' then '23:20_07:00_15:20_23:20'
                          else  '06:00_14:20_22:40_06:00'
                         end;


      insert into @turno values (3,dateadd(day, -1, @pInitialDate), dateadd(day, -1, @pInitialDate)),
                                (1,dateadd(day, -1, @pInitialDate), @pInitialDate),
                                (2,cast(@pInitialDate as date), cast(@pInitialDate as date)),
                                (3,cast(@pInitialDate as date), cast(@pInitialDate as date)),
                                (1, @pInitialDate, dateadd(day, 1,@pInitialDate));

    declare v cursor for
     select v.Id as VeiculoId, v.[Name], v.[SubGroup], v.[Category]
       from [AMBEV].dbo.Veiculo v with (nolock)
      where v.ContaId         = @Contaid
        and v.ModuloVinculado = @ActiveDriver;

    open v;
    fetch next from v into @VeiculoId, @LicensePlate, @Grupo, @Category;

    while @@fetch_status = 0
    begin
     /* Turno */
     declare t cursor for
      select t.Turno, t.DataInicioTurno, t.DataFimTurno
        from (
                select top 2 t.Turno, format(temp.Inicio, 'yyyy-MM-dd '+ cast(t.Inicio as varchar(8))) as [DataInicioTurno],
                       format(temp.Fim, 'yyyy-MM-dd '+ cast(t.Fim as varchar(8))) as [DataFimTurno]
                  from [Conforcebi].[AMBEV].Turno t with (nolock)
                         inner join @turno temp
                            on temp.Ordem = t.OrdemExecucao
                 where TurnoHorario = @Horario
                   and @pInitialDate >= t.[DataDaImplementacao]
                   and @pInitialDate < t.[DataDaImplementacaoNovoturno]
                   and cast(format(temp.Inicio, 'yyyy-MM-dd '+ cast(t.Inicio as varchar(8))) as datetime) <= @pInitialDate
                  order by format(temp.Inicio, 'yyyy-MM-dd '+ cast(t.Inicio as varchar(8))) desc
            ) as t
       order by [DataInicioTurno] asc

      open t
      fetch next from t into @Shift, @CurrentShiftStartDate, @CurrentShiftFinalDate

      while @@fetch_status = 0
      begin

        /* Preencher registrobase */
        truncate table [AMBEV-JUATUBA].RegistroBase;
        with vw_permanencia
        as (
            select VeiculoId, AreaName, EntryDateTime, 
                   case 
                     when DepartureDateTime > lead(EntryDateTime, 1, DepartureDateTime) over (order by EntryDateTime) then
                       dateadd(second, -1, lead(EntryDateTime, 1, DepartureDateTime) over (order by EntryDateTime))
                     else DepartureDateTime
                   end DepartureDateTime
              from [AMBEV].dbo.TempoPermanencia tp with (nolock)
             where ContaId   = @ContaId
               and VeiculoId = @VeiculoId
               and (((tp.EntryDateTime <= (@CurrentShiftStartDate)) and (tp.DepartureDateTime >= @CurrentShiftStartDate)) or ((tp.EntryDateTime >= (@CurrentShiftStartDate) and tp.EntryDateTime <= @CurrentShiftFinalDate)))
            )

        merge [AMBEV-JUATUBA].RegistroBase as target
        using (
                select r.[VeiculoId], isnull(m.[MotoristaId], 0) as [IdMotorista], r.[Data]
                      ,datediff(second,lag([Data], 1,[Data]) over (order by [Data]), [Data]) * (lag([Ignicao], 1 , [Ignicao]) over (order by [Data]) * cast([ignicao] as int)) as [Tempo]
                      ,r.[ignicao],         r.[velocidade],     r.[Input1],    r.[Input2]
                      ,r.[LatitudeDouble] as [Latitude] ,r.[LongitudeDouble] as [Longitude],  r.[gpssignal] as [Gps], r.[Direcao]
                      ,case
                         when Velocidade > 0 
                           then (cast(replace(r.Distancia,',','.') as float)) * (cast(lag([ignicao], 1, 0) over (order by [data]) as int) * cast(r.[Ignicao] as int))
                         else 0 
                       end [Distancia]
                      ,isnull(p.[AreaName], @AreaNameDefault) as [AreaName]
                      , isnull(m.[Name], 'Não identificado') as [Driver], [Descricao]
                  from [AMBEV].[AMBEV-JUATUBA].VeiculoRegistro r with (nolock)
                        left outer join [AMBEV].dbo.Motorista m
                          on m.[MotoristaId] = isnull(right(r.IdMotorista, len(r.IdMotorista) - 1), 0)
                         and m.[Active] = 'S'
                         and m.[ContaId] = @Contaid
                          left outer join vw_permanencia p
                            on r.[Data]     >= p.EntryDateTime
                           and r.[Data]     <  p.DepartureDateTime
                           and r.VeiculoId  =  p.VeiculoId
                  where r.[Data]      >= @CurrentShiftStartDate
                    and r.[Data]      <  @CurrentShiftFinalDate
                    and r.[VeiculoId] =  @VeiculoId
                    and len(r.[Latitude])  >  5
                    and len(r.[Longitude]) >  5
                    and r.SaidaFuzzy  not in ('1.000,00','1.001,00')
                    and r.[Velocidade]     < 18
                    and r.[Descricao] not in ('25', '26', '3', '4', '47|181', '47|182', '47|183', '47|237', '47|255',  '47|183')
             )
            as source( [VeiculoId], [IdMotorista], [Data],   [Tempo]
                      ,[ignicao],   [velocidade],  [Input1], [Input2]
                      ,[Latitude],  [Longitude],   [Gps],    [Direcao]
                      ,[Distancia], [AreaName],    [Driver], [Descricao])
            on (target.[Data] = source.[Data]
            and target.[VeiculoId] = source.[VeiculoId])

        when not matched then
          insert ( [VeiculoId], [IdMotorista], [Data],   [Tempo]
                  ,[ignicao],   [velocidade],  [Input1], [Input2]
                  ,[Latitude],  [Longitude],   [Gps],    [Direcao]
                  ,[Distancia], [AreaName],    [Driver], [Descricao])

          values ( source.[VeiculoId], source.[IdMotorista], source.[Data],   source.[Tempo]
                  ,source.[ignicao],   source.[velocidade],  source.[Input1], source.[Input2]
                  ,source.[Latitude],  source.[Longitude],   source.[Gps],    source.[Direcao]
                  ,source.[Distancia], source.[AreaName],    source.[Driver], source.[Descricao]);

        set @IdTempTurno = next value for [AMBEV-JUATUBA].[Sq_TelemetriaIdTemp];

        insert @TvTelemetria ([ContaId],        
                              [VeiculoId],        [Nome],            [DataRegistroInicial], [DataInicioTurno], [DataFimTurno], [Distancia],       
                              [VelocidadeMedia], [VelocidadeMaxima], [Turno],               [Categoria],       [Grupo],        [IdTemp])

        select @Contaid,    @VeiculoId, @LicensePlate, @pInitialDate, @CurrentShiftStartDate as [DataInicioTurno],
               @CurrentShiftFinalDate as [DataFimTurno],
               isnull(sum(r.[Distancia]),0) as [Distancia],
               isnull(round(avg(r.[Velocidade] * 1.0),0),0) as [VelocidadeMedia],
               isnull(max(r.[Velocidade]),0) as [VelocidadeMaxima],
               @Shift as [Turno],
               @Category,
               @Grupo,
               @IdTempTurno as [IdTemp]
          from [AMBEV-JUATUBA].RegistroBase r
          where r.[VeiculoId] = @VeiculoId
            and r.[Data] >= @CurrentShiftStartDate
            and r.[Data] <  @CurrentShiftFinalDate
            and r.[Descricao] != '9'
            group by r.[Turno]

        set @Distancia = 0;
        /* Motorista */
        insert into @TvTelemetriaMotorista ([Id], [TelemetriaId], [MotoristaId], [MotoristaNome],[Distancia], [VelocidadeMedia], [VelocidadeMaxima])
        select  row_number() over (order by [minData]) as [Id], t.[IdTempTUrno] , t.[IdMotorista], t.[MotoristaNome], t.[Distancia], t.[VelocidadeMedia], t.[VelocidadeMaxima]
          from (
                select @IdTempTurno as [IdTempTurno],
                      [IdMotorista],
                      min(r.[Driver]) as [MotoristaNome],
                      min(r.[Data]) as [minData],
                      isnull(sum(r.[Distancia]),0) as [Distancia],
                      isnull(round(avg(r.[Velocidade] * 1.0),0),0) as [VelocidadeMedia],
                      isnull(max(r.[Velocidade]),0) as [VelocidadeMaxima]
                  from [AMBEV-JUATUBA].[RegistroBase] r
                where [Data]        >= @CurrentShiftStartDate
                  and [Data]        <  @CurrentShiftFinalDate
                  and [VeiculoId]   =  @VeiculoId
                  and r.[Descricao] != '9'
                group by r.[VeiculoId], r.[IdMotorista] ) t

        /* Tempo Area */
        set @EventStartControl    = 0;
        set @CurrentEventName     = 'TempoArea';

        declare r cursor scroll for
        select  r.[Data], r.[AreaName]
          from [AMBEV-JUATUBA].[RegistroBase] r
         where r.[Data]    >= @CurrentShiftStartDate
           and r.[Data]    <  @CurrentShiftFinalDate
           and r.VeiculoId =  @VeiculoId
           and r.[Descricao] != '9';

        open r;
        fetch next from r into @CurrentDate, @CurrentAreaName;

        while @@fetch_status = 0
        begin
          if(@EventStartControl = 0)
          begin
            set @EventStartControl = 1;
            set @InitialDateEvent  = @CurrentDate;
            set @InitialAreaName   = @CurrentAreaName;
          end;
          
          if @EventStartControl= 1
          begin
            set @PreviousDate = @CurrentDate;
          end;

          fetch next from r into @CurrentDate, @CurrentAreaName;

          if @EventStartControl= 1 and (@InitialAreaName != @CurrentAreaName or @@fetch_status   != 0) 
          begin
            set @TotalTimeEvent = datediff(second, @InitialDateEvent, @PreviousDate);

            if @TotalTimeEvent > 0 and @InitialAreaName != @AreaNameDefault
            begin
              select @LatLongList  = geography::STGeomFromText('POINT(' + convert(varchar(15),[latitude],128) + ' ' + convert(varchar(15),[longitude], 128) + ')', 4326)
                from [AMBEV-JUATUBA].[RegistroBase] r
               where [Data]      = @InitialDateEvent
                 and [VeiculoId] =  @VeiculoId;

               select @AvaregeSpeed = isnull(round(avg(r.[Velocidade] * 1.0),0),0),
                        @MaxSpeed     = isnull(max(r.[Velocidade]),0),
                        @Distancia    = isnull(sum(r.[Distancia]),0)
                 from [AMBEV-JUATUBA].[RegistroBase] r
                 where [Data] >= @InitialDateEvent
                   and [Data] <= @PreviousDate
                   and [VeiculoId] =  @VeiculoId
                   and r.[Descricao] != '9'

               insert into @TvTelemetriaLatLong ([Id],              [DataInicioEvento], [DataFimEvento],         [TempoEvento],
                                                 [Distancia],       [TelemetriaId],     [TelemetriaMotoristaId], [TipoEvento],
                                                 [VelocidadeMedia], [VelocidadeMaxima], [Area], [percurso])

                                          values ((select isnull(max([Id]),0) + 1
                                                     from @TvTelemetriaLatLong
                                                    where [TelemetriaId] = @IdTempTurno), @InitialDateEvent,  @PreviousDate, @TotalTimeEvent,
                                                    @Distancia, @IdTempTurno, 0, @CurrentEventName,
                                                    @AvaregeSpeed, @MaxSpeed, @InitialAreaName, @LatLongList);
            end;

            set @Distancia         = 0;
            set @AvaregeSpeed      = 0;
            set @MaxSpeed          = 0;
            set @TotalTimeEvent    = 0;
            set @EventStartControl = 0;
            set @LatLongList = null;
          end;
        end;
        close r;
        deallocate r;

        /* Descida com Velocidade */
        set @EventStartControl = 0;
        set @CurrentEventName = 'Descida com Velocidade';
        declare r cursor scroll for
          select  r.[IdMotorista], r.[Data]    , r.[Latitude],
                r.[Longitude]  , r.[AreaName], r.[Turno],
                  case
                      when (r.[Input2] = 1 and r.[Ignicao] = 1 and r.[Velocidade] >= 8 and [Distancia] >= 13) then @CurrentEventName
                      else @EventDefault
                    end DescVelocidade
           from [AMBEV-JUATUBA].[RegistroBase] r
          where r.[Data]    >= @CurrentShiftStartDate
            and r.[Data]    <  @CurrentShiftFinalDate
            and r.VeiculoId =  @VeiculoId;

        open r;
        fetch next from r into @CurrentDriverId, @CurrentDate, @Latitude, @Longitude, @CurrentAreaName, @CurrentShiftName, @CurrentEvent;

        while @@fetch_status = 0
        begin
          if(@CurrentEvent = @CurrentEventName and @EventStartControl = 0)
          begin
            set @EventStartControl = 1;
            set @InitialDateEvent = @CurrentDate;
            set @InitialAreaName  = @CurrentAreaName;
            set @InitialDriverId  = @CurrentDriverId;
          end;
          
          if @EventStartControl= 1
          begin
            set @PreviousDate = @CurrentDate;
          end;

          fetch next from r into @CurrentDriverId, @CurrentDate, @Latitude, @Longitude, @CurrentAreaName, @CurrentShiftName, @CurrentEvent;

          if @EventStartControl= 1 and (@InitialDriverId != @CurrentDriverId   or @InitialAreaName != @CurrentAreaName or 
                                        @CurrentEvent    != @CurrentEventName  or @@fetch_status   != 0) 
          begin
            select @CurrentDriverEventId = [Id] 
              from @TvTelemetriaMotorista
             where [MotoristaId]  = @InitialDriverId
               and [TelemetriaId] = @IdTempTurno;

            set @TotalTimeEvent = 0;

            select @LatLongList    = geography::STGeomFromText('MULTIPOINT(' + string_agg(convert(nvarchar(max), convert(varchar(15),[latitude],128) + ' ' + convert(varchar(15),[longitude], 128)), ',') + ')', 4326),
                   @AvaregeSpeed   = isnull(round(avg(r.[Velocidade] * 1.0),0),0),
                   @MaxSpeed       = isnull(max(r.[Velocidade]),0),
                   @TotalTimeEvent = datediff(second, @InitialDateEvent, @PreviousDate),
                   @Distancia      = isnull(sum(r.[Distancia]),0)
              from [AMBEV-JUATUBA].[RegistroBase] r
            where [Data]      >= @InitialDateEvent
              and [Data]      <= @PreviousDate
              and [VeiculoId] =  @VeiculoId;

            if @TotalTimeEvent > 0
            begin
              insert into @TvTelemetriaLatLong ([Id],              [DataInicioEvento], [DataFimEvento],         [TempoEvento],
                                                [Distancia],       [TelemetriaId],     [TelemetriaMotoristaId], [TipoEvento],
                                                [VelocidadeMedia], [VelocidadeMaxima], [Area],                  [Percurso])
                                        values ((select isnull(max([Id]),0) + 1
                                                   from @TvTelemetriaLatLong         
                                                  where [TelemetriaId]          = @IdTempTurno
                                                    and [TelemetriaMotoristaId] = @CurrentDriverEventId), @InitialDateEvent,  @PreviousDate, @TotalTimeEvent,
                                                  @Distancia,    @IdTempTurno,       @CurrentDriverEventId, @CurrentEventName,
                                                  @AvaregeSpeed, @MaxSpeed,          @InitialAreaName,      @LatLongList);
            end;

            set @Distancia         = 0;
            set @AvaregeSpeed      = 0;
            set @MaxSpeed          = 0;
            set @TotalTimeEvent    = 0;
            set @EventStartControl = 0;
            set @LatLongList       = null;
          end;
        end;
        close r;
        deallocate r;

        /* Eventos Motor */
        set @EventStartControl = 0;
        declare l cursor for
        with vw_motorligado
        as
        (select f.[VeiculoId], f.[Data], f.Tempo, f.IgnicaoOnOff, f.[IdMotorista], f.[AreaName], [ignicao]
              from (
            select v.[VeiculoId], v.[Data], v.[ignicao], v.[IdMotorista], v.[AreaName]
                  ,datediff(second,lag([Data], 1,[Data]) over (order by [Data]), [Data]) *
                            (lag([Ignicao], 1 , [Ignicao]) over (order by [Data]) * cast([ignicao] as int)) as Tempo
                  ,case
                     when datediff(second, lag([Data], 1,[Data]) over (order by [Data]), [Data]) * cast([ignicao] as int) > 300 then 'L'
                     when v.[Ignicao] = 1 and lag(v.[Ignicao], 1, 0) over (order by v.[data]) = 0 then 'L'
                     when datediff(second, [Data], lead([Data], 1,[Data]) over (order by [Data])) *
                                  (lag([Ignicao], 1 , [Ignicao]) over (order by [Data]) * cast([ignicao] as int)) > 300 then 'D'
                     when v.[Ignicao] = 1 and lead(v.[Ignicao], 1, 0) over (order by v.[data]) = 0 then 'D'
                     else 'N'
                   end IgnicaoOnOff
              from (
                    select r.[VeiculoId], r.[Data],  r.[Ignicao], r.[Input1], r.[IdMotorista], r.[AreaName]
                      from [AMBEV-JUATUBA].[RegistroBase] r
                       ) as v) f)
          select [Data], IgnicaoOnOff
                ,lead([Data], 1, [Data]) over (order by [Data]) PreviousData
                ,lead(IgnicaoOnOff, 1, IgnicaoOnOff) over (order by [Data]) PreviousIgnicaoOnOff
                ,iif([IdMotorista] != '0', [IdMotorista], lead([IdMotorista],1,IdMotorista) over (order by [data])) MotoristaId
                ,[AreaName]
            from vw_motorligado
            where IgnicaoOnOff in ('L', 'D');

        open l;
        fetch next from l into @Data, @IgnicaoOnOff, @PreviousDate, @PreviousIgnicaoOnOff, @CurrentDriverId, @CurrentAreaName;

        while @@fetch_status = 0
        begin
          if @IgnicaoOnOff = 'L' and @PreviousIgnicaoOnOff = 'D'
          begin
            select @CurrentDriverEventId = isnull([Id], 0)
                from @TvTelemetriaMotorista
               where [MotoristaId]  = @CurrentDriverId
                 and [TelemetriaId] = @IdTempTurno;

            select @AvaregeSpeed = isnull(round(avg(r.[Velocidade] * 1.0),0),0),
                   @MaxSpeed = isnull(max(r.[Velocidade]),0),
                   @Distancia = isnull(sum(r.[Distancia] * [Ignicao]),0)
              from [AMBEV-JUATUBA].[RegistroBase] r
             where [Data] >= @Data
               and [Data] <= @PreviousDate

            set @TotalTimeEvent = datediff(second, @Data, @PreviousDate);
            set @TotalTimeByShift = @TotalTimeByShift + @TotalTimeEvent;

            update @TvTelemetriaMotorista
               set [TempoLigado] = [TempoLigado] + @TotalTimeEvent
             where [MotoristaId]  = @CurrentDriverId
               and [TelemetriaId] = @IdTempTurno;

            if @CurrentDriverEventId is null
               set @CurrentDriverEventId = 0;

            insert into @TvTelemetriaLatLong ([Id],              [DataInicioEvento], [DataFimEvento],         [TempoEvento],
                                              [Distancia],       [TelemetriaId],     [TelemetriaMotoristaId], [TipoEvento],
                                              [VelocidadeMedia], [VelocidadeMaxima], [Area],                  [Percurso])
                                     values ((select isnull(max([Id]),0) + 1
                                                from @TvTelemetriaLatLong
                                               where [TelemetriaId]          = @IdTempTurno
                                                 and [TelemetriaMotoristaId] = @CurrentDriverEventId), @Data,  @PreviousDate, @TotalTimeEvent,
                                              @Distancia,    @IdTempTurno, @CurrentDriverEventId, 'Motor Ligado',
                                              @AvaregeSpeed, @MaxSpeed,    @CurrentAreaName,      null);
          end;

          fetch next from l into @Data, @IgnicaoOnOff, @PreviousDate, @PreviousIgnicaoOnOff, @CurrentDriverId, @CurrentAreaName;
        end;

        close l;
        deallocate l;

        /* Ré */
        declare l cursor for
        with vw_motorligado
        as
        (select f.[VeiculoId], f.[Data], f.TempoRe, f.ReOnOff, f.[IdMotorista], f.[AreaName], [ignicao]
              from (
            select v.[VeiculoId], v.[Data], v.[ignicao], v.[IdMotorista], v.[AreaName]
                  ,datediff(second,lag([Data], 1,[Data]) over (order by [Data]), [Data]) *
                            (lag([Input1], 1 , [Input1]) over (order by [Data]) * cast([Input1] as int)) *
                            (lag([Ignicao], 1 , [Ignicao]) over (order by [Data]) * cast([ignicao] as int)) as TempoRe
                 ,case
                    when v.[Ignicao] = 1 and v.[Input1] = 1 and lag(v.[Input1], 1, 0) over (order by v.[data]) = 0 then 'L'
                    when v.[Ignicao] = 1 and v.[Input1] = 1 and lead(v.[Input1],1, 0) over (order by v.[data]) = 0 then 'D'
                    else 'N'
                  end ReOnOff
              from (
                    select r.[VeiculoId], r.[Data],  r.[Ignicao], r.[velocidade], r.[Input1], r.[IdMotorista], r.[AreaName]
                      from [AMBEV-JUATUBA].[RegistroBase] r
                       ) as v) f)
          select [Data], ReOnOff
                ,lead([Data], 1, [Data]) over (order by [Data]) PreviousData
                ,lead(ReOnOff, 1, ReOnOff) over (order by [Data]) PreviousReOnOff
                ,[IdMotorista], [AreaName]
            from vw_motorligado
            where ReOnOff in ('L', 'D');

        open l;
        fetch next from l into @Data, @ReOnOff, @PreviousDate, @PreviousReOnOff, @CurrentDriverId, @CurrentAreaName;

        while @@fetch_status = 0
        begin
          if @ReOnOff = 'L' and @PreviousReOnOff = 'D'
          begin
            select @CurrentDriverEventId = [Id]
              from @TvTelemetriaMotorista
             where [MotoristaId]  = @CurrentDriverId
               and [TelemetriaId] = @IdTempTurno;

            select @LatLongList    = geography::STGeomFromText('MULTIPOINT(' + string_agg(convert(nvarchar(max), convert(varchar(15), t.[latitude],128) + ' ' + convert(varchar(15), t.[longitude], 128)), ',') within group (order by [DataIni]) + ')', 4326),
                   @AvaregeSpeed   = isnull(round(avg(t.[VelocidadeMedia] * 1.0),0),0),
                   @MaxSpeed       = isnull(max(t.[VelocidadeMaxima]),0),
                   @TotalTimeEvent = datediff(second, min([DataIni]), max([DataFim])),
                   @Distancia      = isnull(sum(t.[DistanciaTotal]),0)
              from (
                    select isnull(round(avg(r.[Velocidade] * 1.0),0),0) as [VelocidadeMedia],
                           min([Data]) as [DataIni], max([Data]) as [DataFim],
                           isnull(max(r.[Velocidade]),0) as [VelocidadeMaxima],
                           isnull(sum(r.[Distancia] * [Ignicao]),0) as [DistanciaTotal],
                           [Latitude], [Longitude]
                      from [AMBEV-JUATUBA].[RegistroBase] r
                      where [Data] >= @Data
                        and [Data] <= @PreviousDate
                      group by [Latitude], [Longitude]) t;

            set @TotalTimeEvent = datediff(second, @Data, @PreviousDate);

            insert into @TvTelemetriaLatLong ([Id],              [DataInicioEvento], [DataFimEvento],         [TempoEvento],
                                              [Distancia],       [TelemetriaId],     [TelemetriaMotoristaId], [TipoEvento],
                                              [VelocidadeMedia], [VelocidadeMaxima], [Area],                  [Percurso])
                                     values ((select isnull(max([Id]),0) + 1
                                                from @TvTelemetriaLatLong
                                               where [TelemetriaId]          = @IdTempTurno
                                                 and [TelemetriaMotoristaId] = @CurrentDriverEventId), @Data,  @PreviousDate, @TotalTimeEvent,
                                              @Distancia,    @IdTempTurno, @CurrentDriverEventId, 'Ré',
                                              @AvaregeSpeed, @MaxSpeed,    @CurrentAreaName,      @LatLongList);
          end;

          fetch next from l into @Data, @ReOnOff, @PreviousDate, @PreviousReOnOff, @CurrentDriverId, @CurrentAreaName;
        end;

        close l;
        deallocate l;

        /* Motor ocioso */
        declare l cursor for
        with vw_motorligado
        as
        (select f.[VeiculoId], f.[Data], f.TempoOcioso, f.[IdMotorista], f.[AreaName]
               ,case
                  when lag(f.TempoOcioso, 1, 0) over (order by f.[data]) = 0 and TempoOcioso > 0 then 'I'
                  when TempoOcioso > 0 and lead(f.TempoOcioso, 1, 0) over (order by f.[data]) = 0 then 'F'
                  else 'N'
                end OciosoIniFim, [ignicao]
              from (
            select v.[VeiculoId], v.[Data], v.[ignicao], v.[IdMotorista], v.[AreaName]
                  ,datediff(second,lag([Data], 1,[Data]) over (order by [Data]), [Data]) *
                            (lag(SemMovimento, 1 , SemMovimento) over (order by [Data]) * SemMovimento) *
                            (lag(SemInput1, 1 , SemInput1) over (order by [Data]) * SemInput1) *
                            (lag(SemInput2, 1 , SemInput2) over (order by [Data]) * SemInput2) *
                            (lag([Ignicao], 1 , [Ignicao]) over (order by [Data]) * cast([ignicao] as int)) as TempoOcioso
              from (
                    select r.[VeiculoId], r.[Data],iif(datediff(second,lag([Data], 1,[Data]) over (order by [Data]), [Data]) > 300, 0, r.[Ignicao]) as ignicao
                          , r.[velocidade], r.[Input1], r.[Input2], r.[IdMotorista], r.[AreaName]
                          ,case 
                             when r.[velocidade] > 0 then 0
                             else 1
                           end SemMovimento
                           ,case 
                             when r.[velocidade] > 0 then 1
                             else 0
                           end ComMovimento
                           ,case when r.[Input1] = 1  then 0
                             else 1
                           end SemInput1
                           ,case 
                             when r.[Input2] = 1 then 0
                             else 1
                           end SemInput2
                      from [AMBEV-JUATUBA].[RegistroBase] r
                     where r.[Descricao] != '9'
                       and r.gps = 1
                   ) as v) f)
          select [Data], [IdMotorista], [AreaName], OciosoIniFim
            from vw_motorligado
            where OciosoIniFim in ('I', 'F')

        open l;
        fetch next from l into @Data, @CurrentDriverId, @CurrentAreaName, @OciosoIniFim;

        set @TotalTimeEvent = 0
        set @EventStartControl = 0;
        set @CurrentEventName  = @IdleEngineName;
        while @@fetch_status   = 0
        begin
          if @OciosoIniFim = 'I'
          begin
            set @InitialDateEvent = @Data;
          end
          else if @OciosoIniFim = 'F'
          begin
            if datediff(second, @InitialDateEvent, @Data) > 180
            begin
              set @TotalTimeEvent = datediff(second, @InitialDateEvent, @Data);

              select @CurrentDriverEventId = [Id] 
                from @TvTelemetriaMotorista
               where [MotoristaId]  = @CurrentDriverId
                 and [TelemetriaId] = @IdTempTurno;
              
                select @LatLongList  = geography::STGeomFromText('POINT(' + convert(varchar(15),[latitude],128) + ' ' + convert(varchar(15),[longitude], 128) + ')', 4326)
                  from [AMBEV-JUATUBA].[RegistroBase] r
                 where [Data]      = @InitialDateEvent
                   and [VeiculoId] =  @VeiculoId;
              
                update @TvTelemetriaMotorista
                   set [TempoOcioso] = [TempoOcioso] + @TotalTimeEvent
                 where [MotoristaId]  = @CurrentDriverId
                   and [TelemetriaId] = @IdTempTurno;
              
                set @TotalIdleTimeByShift = @TotalIdleTimeByShift + @TotalTimeEvent
              
                insert into @TvTelemetriaLatLong ([Id],    [DataInicioEvento], [DataFimEvento],         [TempoEvento],
                                                 [Distancia],       [TelemetriaId],     [TelemetriaMotoristaId], [TipoEvento],
                                                 [VelocidadeMedia], [VelocidadeMaxima], [Area],                  [Percurso])
                                          values ((select isnull(max([Id]),0) + 1
                                                    from @TvTelemetriaLatLong
                                                   where [TelemetriaId]          = @IdTempTurno
                                                     and [TelemetriaMotoristaId] = @CurrentDriverEventId), @InitialDateEvent,  @Data, @TotalTimeEvent,
                                                   0, @IdTempTurno, @CurrentDriverEventId, 'Motor Ocioso',
                                                   0, 0,            @InitialAreaName,      @LatLongList);
            end;

            set @TotalTimeEvent    = 0;
            set @EventStartControl = 0;
            set @InitialDateEvent = @Data;
            set @LatLongList       = null;
          end;        

          fetch next from l into @Data, @CurrentDriverId, @CurrentAreaName, @OciosoIniFim;
        end;
        close l;
        deallocate l;

         set @TotalEffectiveTimeByShift = @TotalTimeByShift - @TotalIdleTimeByShift;
         set @TotalOffByShift = datediff(second, @CurrentShiftStartDate,@CurrentShiftFinalDate) - @TotalTimeByShift;

         update @TvTelemetria
            set [TempoLigado] = @TotalTimeByShift, [TempoEfetivo] = @TotalEffectiveTimeByShift, [TempoOcioso] = @TotalIdleTimeByShift, [TempoDesligado] = @TotalOffByShift

         update @TvTelemetriaMotorista
            set [TempoEfetivo] = ([TempoLigado] - [TempoOcioso])

         set @TotalOffByShift           = 0
         set @TotalEffectiveTimeByShift = 0
         set @TotalTimeByShift          = 0
         set @TotalIdleTimeByShift      = 0

         /* Merge com as tabelas fim */
        insert into @TvNewTelemetriaId (TelemetriaId, TelemetriaIdTemp)
        select Id as TelemetriaId, IdTemp as TelemetriaIdTemp
          from (
            merge [AMBEV-JUATUBA].[Telemetria] as target
            using (
                  select [ID],
                         [ContaId],         [VeiculoId],   [Nome],           [DataRegistroInicial], [DataInicioTurno],
                         [DataFimTurno],    [TempoLigado], [TempoEfetivo], [TempoOcioso], [TempoDesligado], [Distancia], [VelocidadeMaxima],
                         [VelocidadeMedia], [Turno],       [Categoria],      [Grupo],               [IdTemp]
                    from @TvTelemetria
                  ) as source ([ID],
                               [ContaId],         [VeiculoId],   [Nome],           [DataRegistroInicial], [DataInicioTurno],
                               [DataFimTurno],    [TempoLigado], [TempoEfetivo], [TempoOcioso], [TempoDesligado], [Distancia], [VelocidadeMaxima],
                               [VelocidadeMedia], [Turno],       [Categoria],      [Grupo],               [IdTemp])

              on (target.DataInicioTurno     = source.DataInicioTurno
              and target.VeiculoId           = source.VeiculoId)

          when matched then 
                update set target.[DataFimTurno]     = source.[DataFimTurno],
                           target.[TempoLigado]      = source.[TempoLigado],
                           target.[TempoEfetivo]     = source.[TempoEfetivo],
                           target.[TempoOcioso]      = source.[TempoOcioso],
                           target.[TempoDesligado]   = source.[TempoDesligado],
                           target.[Distancia]        = source.[Distancia],
                           target.[VelocidadeMaxima] = source.[VelocidadeMaxima],
                           target.[VelocidadeMedia]  = source.[VelocidadeMedia],
                           target.[IdTemp]           = source.[IdTemp]

          when not matched then
            insert ( [ContaId],         [VeiculoId],        [Nome],         [DataRegistroInicial], [DataInicioTurno],
                     [DataFimTurno],    [TempoLigado],      [TempoEfetivo], [TempoOcioso],    [TempoDesligado], [Distancia], 
                     [VelocidadeMedia], [VelocidadeMaxima], [Turno],        [Categoria],      [Grupo],               [IdTemp])

            values ( source.[ContaId],          source.[VeiculoId],   source.[Nome],         source.[DataRegistroInicial], source.[DataInicioTurno],
                     source.[DataFimTurno],     source.[TempoLigado], source.[TempoEfetivo], source.[TempoOcioso],         source.[TempoDesligado],  source.[Distancia], source.[VelocidadeMedia],
                     source.[VelocidadeMaxima], source.[Turno],       source.[Categoria],    source.[Grupo],               source.[IdTemp])

          output $action, inserted.Id, inserted.IdTemp) as changes(action, Id, IdTemp);

          update @TvTelemetriaMotorista
             set TelemetriaId = n.TelemetriaId
            from @TvTelemetriaMotorista t
                 inner join @TvNewTelemetriaId n
              on t.TelemetriaId = n.TelemetriaIdTemp

          update @TvTelemetriaLatlong
             set TelemetriaId = n.TelemetriaId
            from @TvTelemetriaLatlong t
                 inner join @TvNewTelemetriaId n
              on t.TelemetriaId = n.TelemetriaIdTemp;

            /* Merge - Verifica se registro já existe na tabela filha - Motorista */
            merge [AMBEV-JUATUBA].[TelemetriaMotorista] as target
            using(
                  select m.[TelemetriaId]
                    from @TvTelemetriaMotorista m
                           inner join [AMBEV-JUATUBA].[Telemetria] t
                              on m.TelemetriaId = t.Id
                  ) as source ([TelemetriaId])
                  on (target.[TelemetriaId] = source.[TelemetriaId])

                when matched then
                  delete;

          /* Merge - Insere os dados na tabela filha motorista */
          merge [AMBEV-JUATUBA].[TelemetriaMotorista] as target
          using(
                select m.[Id], 
                       m.[TelemetriaId],  m.[MotoristaId],     m.[Distancia],
                       m.[MotoristaNome], m.[TempoLigado], m.[TempoEfetivo], m.[TempoOcioso],  m.[VelocidadeMedia], m.[VelocidadeMaxima]
                  from @TvTelemetriaMotorista m
                 where [TempoLigado] != 0
                ) as source ([Id],
                             [TelemetriaId],       [MotoristaId], [Distancia],
                             [MotoristaNome], [TempoLigado], [TempoEfetivo], [TempoOcioso], [VelocidadeMedia], [VelocidadeMaxima])

                on (target.[TelemetriaId] = source.[TelemetriaId]
                and target.[MotoristaId] = source.[MotoristaId])

              when matched then 
                  update set 
                             target.[Distancia]        = source.[Distancia],
                             target.[TempoLigado]      = source.[TempoLigado],
                             target.[TempoEfetivo]     = source.[TempoEfetivo],
                             target.[TempoOcioso]      = source.[TempoOcioso],
                             target.[VelocidadeMedia]  = source.[VelocidadeMedia],
                             target.[VelocidadeMaxima] = source.[VelocidadeMaxima]

              when not matched then
                  insert ([Id],
                          [TelemetriaId],  [MotoristaId], [Distancia],
                          [MotoristaNome], [TempoLigado], [TempoEfetivo], [TempoOcioso], [VelocidadeMedia], [VelocidadeMaxima])
                  values (source.[Id],
                          source.[TelemetriaId],  source.[MotoristaId], source.[Distancia],
                          source.[MotoristaNome], source.[TempoLigado], source.[TempoEfetivo], source.[TempoOcioso], source.[VelocidadeMedia], source.[VelocidadeMaxima]);

            /* Merge - Verifica se registro já existe na tabela filha - Latlong */
            merge [AMBEV-JUATUBA].[TelemetriaMotoristaEvento] as target
            using(
                  select l.[Id], l.[TelemetriaId]
                    from @TvTelemetrialatLong l
                           inner join [AMBEV-JUATUBA].[Telemetria] t
                              on l.TelemetriaId = t.Id
                  ) as source ([Id], [TelemetriaId])
                  on (target.[TelemetriaId] = source.[TelemetriaId])

                when matched then
                  delete;
 
            /* Merge - Insere os dados na tabela filha - Latlong */
            merge [AMBEV-JUATUBA].[TelemetriaMotoristaEvento] as target
            using(
                  select l.[Id],
                         l.[TelemetriaId],  l.[TelemetriaMotoristaId], l.[DataInicioEvento],
                         l.[DataFimEvento], l.[TempoEvento],           l.[Distancia],    l.[TipoEvento],
                         l.[VelocidadeMedia], l.[VelocidadeMaxima],    l.[Area],         l.[Percurso]
                    from @TvTelemetrialatLong l
                   where [TempoEvento] != 0
                  ) as source ([Id], [TelemetriaId], [TelemetriaMotoristaId] , [DataInicioEvento], [DataFimEvento],
                               [TempoEvento]    , [Distancia]       , [TipoEvento]   ,
                               [VelocidadeMedia], [VelocidadeMaxima], [Area]         , [Percurso])
                  on (target.[TipoEvento]            = source.[TipoEvento]
                  and target.[TelemetriaId]          = source.[TelemetriaId]
                  and target.[TelemetriaMotoristaId] = source.[TelemetriaMotoristaId])

                when not matched then
                    insert ([Id],               [TelemetriaId],  [TelemetriaMotoristaId],
                            [DataInicioEvento], [DataFimEvento], [TempoEvento],
                            [Distancia],        [TipoEvento],    [VelocidadeMedia], 
                            [VelocidadeMaxima], [Area],          [Percurso])
                    values (source.[Id],               source.[TelemetriaId],  source.[TelemetriaMotoristaId],
                            source.[DataInicioEvento], source.[DataFimEvento], source.[TempoEvento],
                            source.[Distancia],        source.[TipoEvento],    source.[VelocidadeMedia],
                            source.[VelocidadeMaxima], source.[Area],          source.[Percurso]);
          
          delete @TvTelemetriaLatlong;
          delete @TvTelemetriaMotorista
          delete @TvNewTelemetriaId;
          delete @TvTelemetria;
        fetch next from t into @Shift, @CurrentShiftStartDate, @CurrentShiftFinalDate
      end;
      close t;
      deallocate t;

      fetch next from v into @VeiculoId, @LicensePlate, @Grupo, @Category;
    end;
    close v;
    deallocate v;

  commit transaction;
  end try
  begin catch
    rollback transaction;
    select error_number() as Code,
           error_line() as Line,
           error_message() + ' - ' + Cast(@VeiculoId as varchar(7)) as [Message];
  end catch;
end;
