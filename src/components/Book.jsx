import { useState, useEffect } from "react";
import { Page } from "./Page";
import { useSelector } from "react-redux";
import { getAllPages, getCurrentPage } from "../features/pagesSlice";

export const Book = ({ ...props }) => {
  const pages = useSelector(getAllPages);
  const currentPage = useSelector(getCurrentPage);
  const [delayedPage, setDelayedPage] = useState(currentPage);

  useEffect(() => {
    let timeout;
    const goToPage = () => {
      setDelayedPage((delayedPage) => {
        if (currentPage === delayedPage) {
          return delayedPage;
        } else {
          timeout = setTimeout(
            () => {
              goToPage();
            },
            Math.abs(currentPage - delayedPage) > 2 ? 50 : 150
          );
          if (currentPage > delayedPage) {
            return delayedPage + 1;
          }
          if (currentPage < delayedPage) {
            return delayedPage - 1;
          }
        }
      });
    };
    goToPage();
    return () => {
      clearTimeout(timeout);
    };
  }, [currentPage]);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {[...pages].map((pageData, index) => (
        <Page
          key={index}
          page={delayedPage}
          number={index}
          opened={delayedPage > index}
          bookClosed={delayedPage === 0 || delayedPage === pages.length}
          {...pageData}
        />
      ))}
    </group>
  )
}