import SheetLoading from "../sheetsDash/SheetLoading";
import MysheetsCard from "./MysheetsCard";
import { useState, useEffect } from "react";
import { getAllSheetsStats } from "../../../api/sheets.api";

function Mysheets() {
  const [sheetsData, setSheetsData] = useState(null);
  const [error, setError] = useState(false);

  const fetchMySheets = async () => {
    try {
      const { data } = await getAllSheetsStats();
      setSheetsData(data);
    } catch (err) {
      console.error("Error fetching my sheets:", err);
      setError(true);
    }
  };

  useEffect(() => {
    fetchMySheets();
  }, []);

  return (
    <div className="@container text-white">
      <h1 className="mb-6 text-3xl font-bold">My Sheets</h1>

      {error ? (
        <p role="alert" className="text-gray-300">Could not load sheets.</p>
      ) : sheetsData?.length === 0 ? (
        <p className="text-gray-300">No sheets available.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 @min-[28rem]:grid-cols-2 @min-[42rem]:grid-cols-3">
          {sheetsData ? sheetsData.map((sheet) => (
            <MysheetsCard key={sheet.slug} sheet={sheet} />
          )) : <SheetLoading overview />}
        </div>
      )}
    </div>
  );
}

export default Mysheets;
