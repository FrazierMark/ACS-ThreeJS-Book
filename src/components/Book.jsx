import { Page } from "./Page";
import { useSelector } from "react-redux";
import { allPages, selectCurrentPage } from "../features/pagesSlice";

export const Book = ({ ...props }) => {
  const pages = useSelector(allPages);
  const currentPage = useSelector(selectCurrentPage);

  return (
    <group {...props} rotation-y={-Math.PI / 2}>
      {
        [...pages].map((pageData, index) => (
          <Page key={index} page={currentPage} number={index} opened={currentPage > index} {...pageData} />
        ))
      }
    </group>
  )
}