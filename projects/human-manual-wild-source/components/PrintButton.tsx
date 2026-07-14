"use client";

export function PrintButton() {
  return <button className="ghost-button" onClick={() => window.print()}>打印 / 存为 PDF</button>;
}
