import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { bitable, IOpenTextSegment } from "@lark-base-open/js-sdk";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>
);

function LoadApp() {
  const [info, setInfo] = useState("正在计算中...");
  useEffect(() => {
    const fn = async () => {
      setInfo("正在计算中...");
      const table = await bitable.base.getActiveTable();
      const fieldIdList = await table.getFieldMetaList();
      const recordNames = fieldIdList.map((field) => field.name);
      const paramsFieldId =
        fieldIdList.find((field) => field.name == "params")?.id ?? "";
      //如果没有params字段，则需要创建

      const rowRecords = await table.getRecords({
        pageSize: 5000,
      });
      let paramsStr = "";
      console.log(rowRecords.records.length);
      for (const record of rowRecords.records) {
        paramsStr = "";
        let keys = Object.keys(record.fields);
        let values = Object.values(record.fields);
        for (let i = 0; i < values.length; i++) {
          if (values[i] !== null) {
            const filed = await table.getField(keys[i]);
            const name = await filed.getName();
            if (name != "id" && name != "params") {
              paramsStr += `&${name}=${
                (values[i] as unknown as IOpenTextSegment[])[0]?.text
              }`;
            }
          }
        }
        if (paramsStr) {
          paramsStr = paramsStr.slice(1);
          table.setCellValue(paramsFieldId, record.recordId, btoa(paramsStr));
        }
      }
      setInfo("计算完成");
    };
    fn();
  }, []);

  return (
    <div>
      <p>{info}</p>
    </div>
  );
}
