import { Page } from "./Page";
import { useSelector } from "react-redux";
import { allPages } from "../features/pagesSlice";

export const Book = ({ ...props }) => {
  const pages = useSelector(allPages);

  return (
    <group {...props}>
      {
        [...pages].map((pageData, index) => (
          index === 0 ? (
            <Page position-x={index * 0.15} key={index} number={index} {...pageData} />
          ) : (
            null
          )
        ))
      }
    </group>
  )
}