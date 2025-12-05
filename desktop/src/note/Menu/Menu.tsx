import React, { useEffect, useState } from "react";

import styles from "./Menu.module.css";
import Line from "../../components/line/Line";

const Menu = () => {
  const [search, setSearch] = React.useState("");
  const [currentOption, setCurrentOption] = React.useState(0);

  const choises = [
    {
      id: 1,
      name: "SQL Server Como criar procedure",
    },
    {
      id: 2,
      name: "SQL Server Apagar Consulta",
    },
  ];

  return (
    <div className={styles.menu}>
      <div className={styles.logo}>LOCAL NOTE</div>
      <input
        className={styles.search}
        type="text"
        placeholder="Pesquise aqui"
      />
      <Line />

      <div className={styles.options}>
        {choises.map((item) => (
          <div
            key={item.id}
            className={`${styles.option} ${
              currentOption === item.id ? styles.selected : ""
            }`}
            onClick={() => setCurrentOption(item.id)}
          >
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
