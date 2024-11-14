import { Table } from "@mantine/core";
import { IconCaretRight } from "@tabler/icons-react";
import React, { forwardRef } from "react";

type TableLayoutProps = {
  th: React.ReactNode;
  rows: React.ReactNode[];
  title: string;
  className?: string;
  nextHandler?: () => void;
  prevHandler?: () => void;
  pageNo?: number;
  data?: any[];
};

const TableLayout = forwardRef<HTMLDivElement, TableLayoutProps>(
  (
    { th, rows, title, className, nextHandler, prevHandler, pageNo, data },
    ref
  ) => {
    return (
      <section
        ref={ref}
        className={`border-[1px] rounded-md border-[#fff] bg-[#fff] ${
          className ? className : ""
        }`}
      >
        <p className="uppercase p-4 font-bold text-[#961699]">
          {title.replace(/recent/gi, "").trim()}
        </p>

        <div className="w-full pt-4 overflow-scroll">
          <Table verticalSpacing="sm">
            <thead
              style={{
                backgroundColor: "#FFFFFF",
              }}
            >
              {th}
            </thead>

            {rows.length !== 0 ? (
              <tbody>{rows}</tbody>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={10} className="text-center">
                    No data yet
                  </td>
                </tr>
              </tbody>
            )}
          </Table>
        </div>

        {title !== "RECENT ELECTIONS" &&
          title !== "RECENT CANDIDATES" &&
          title !== "RECENT VOTERS" && (
            <div className="flex items-center gap-3 justify-end md:justify-between border-t border-[#ced4da] p-4">
              <aside className="hidden md:block">
                <p className="text-[#667085] text-sm">
                  Showing 1 - {data?.length}
                </p>
              </aside>

              <aside className="flex items-center gap-3 justify-end">
                {pageNo !== 1 && (
                  <button
                    className="px-2 p-1 bg-[#F4ECFB] border-none rounded cursor-pointer hover:bg-[#F4ECFB] hover:opacity-70 rotate-180"
                    onClick={prevHandler}
                  >
                    <IconCaretRight stroke={1.5} size={20} color="#68066A" />
                  </button>
                )}

                <button className="px-[0.9rem] py-[0.3rem] bg-[#F4ECFB] border-none rounded cursor-pointer hover:bg-[#F4ECFB] hover:opacity-70 text-[#68066A]">
                  {pageNo}
                </button>

                {!title.includes("(categorized)") &&
                  data &&
                  data.length >= 100 && (
                    <button
                      className="px-2 p-1 bg-[#F4ECFB] border-none rounded cursor-pointer hover:bg-[#F4ECFB] hover:opacity-70"
                      onClick={nextHandler}
                    >
                      <IconCaretRight stroke={1.5} size={20} color="#68066A" />
                    </button>
                  )}
              </aside>
            </div>
          )}
      </section>
    );
  }
);

TableLayout.displayName = "TableLayout";

export default TableLayout;
