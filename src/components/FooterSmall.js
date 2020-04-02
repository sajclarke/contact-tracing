import React from "react";

export default function FooterSmall(props) {
  return (
    <>
      <footer
        className={
          (props.absolute
            ? "absolute w-full bottom-0 bg-gray-900"
            : "relative bottom-0 bg-gray-900") + " pb-6"
        }
      >
        <div className="container mx-auto px-4">
          <hr className="mb-6 border-b-1 border-gray-700" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">

            <div className="px-4">
              <div className="text-sm text-white font-semibold py-1">
                Copyright © {new Date().getFullYear()}{" "}
                <a
                  href="https://www.wifetch.com"
                  className="text-white hover:text-gray-400 text-sm font-semibold py-1"
                >
                  {/* <span className="hover:text-yellow-500">WiFetch</span> */}
                </a>
              </div>
            </div>

            <div className="px-4 text-xs">
              <p className="text-white">Developed by{' '}
                <span className="p-1 rounded hover:bg-yellow-500">
                  <a
                    href="https://www.shannonclarke.com"
                    target="_blank"
                    className="text-gray-600 group-hover:text-white"
                  >
                    Shannon Clarke
                </a>
                </span>
              </p>

            </div>

          </div>
        </div>
      </footer>
    </>
  );
}
