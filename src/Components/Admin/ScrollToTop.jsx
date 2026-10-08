import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Browser window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // HTML / Body scroll
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Admin panel ke possible scroll containers
    const scrollContainers = document.querySelectorAll(
      "main, [data-admin-scroll], .overflow-y-auto, .overflow-auto"
    );

    scrollContainers.forEach((element) => {
      element.scrollTop = 0;
      element.scrollLeft = 0;
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;