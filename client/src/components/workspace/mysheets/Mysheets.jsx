import React from "react";
import MysheetsCard from "./MysheetsCard";
import { useState, useEffect } from "react";
import { getAllSheetsStats } from "../../../api/sheets.api";

function Mysheets() {
  const [sheetsData, setSheetsdata] = useState([]);

  const fetchMySheets = async () => {
    try {
      const { data } = await getAllSheetsStats();
      setSheetsdata(data);
    } catch (err) {
      console.error("Error fetching my sheets:", err);
    }
  };

  useEffect(() => {
    fetchMySheets();
  }, []);

  return (
    <div className="@container text-white">
      <h1 className="mb-6 text-3xl font-bold">My Sheets</h1>

      <div className="grid grid-cols-1 gap-4 @min-[28rem]:grid-cols-2 @min-[42rem]:grid-cols-3">
        {sheetsData.map((sheet) => (
          <MysheetsCard key={sheet.slug} sheet={sheet} />
        ))}
      </div>
    </div>
  );
}

export default Mysheets;
