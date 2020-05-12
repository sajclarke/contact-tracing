import React from "react";
import { useTable, useFilters, useSortBy, usePagination } from "react-table";
import '../assets/Table.css'

// Define a default UI for filtering
function DefaultColumnFilter({
    column: { filterValue, preFilteredRows, setFilter },
}) {
    // const count = preFilteredRows.length

    return (
        <input
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            value={filterValue || ''}
            onClick={e => e.stopPropagation()}
            onChange={e => {
                setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
            }}
            placeholder={`Search ...`}
        />
    )
}



export default function Table({ title, columns, data, fixed, initialState }) {
    // const [filterInput, setFilterInput] = useState("");
    // Use the state and functions returned from useTable to build your UI

    const defaultColumn = React.useMemo(
        () => ({
            // Let's set up our default Filter UI
            Filter: DefaultColumnFilter,
        }),
        []
    )
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        // rows,
        prepareRow,
        // setFilter,
        page,
        canPreviousPage,
        canNextPage,
        pageOptions,
        pageCount,
        gotoPage,
        nextPage,
        previousPage,
        setPageSize,
        state: { pageIndex, pageSize },
    } = useTable(
        {
            columns,
            data,
            initialState,
            defaultColumn,
        },
        useFilters,
        useSortBy,
        usePagination
    );





    // Render the UI for your table
    return (
        <>
            <div className="mb-4">
                <label className="block text-gray-700 text-lg font-bold mb-2" >
                    {title}
                </label>

            </div>

            <table className={(fixed ? "table-fixed" : "table-auto") + " w-full rounded border-solid border-1 border-gray-400"} {...getTableProps()}>
                <thead>
                    {headerGroups.map(headerGroup => (
                        <tr {...headerGroup.getHeaderGroupProps()}>
                            {headerGroup.headers.map(column => (
                                <th
                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                    className="px-4 py-2 uppercase text-sm text-gray-700 border-solid border-1 border-gray-400 font-normal"
                                // width='20%'
                                // className={
                                //     column.isSorted
                                //         ? column.isSortedDesc
                                //             ? "sort-desc"
                                //             : "sort-asc"
                                //         : ""
                                // }
                                >
                                    {column.render("Header")}{'  '}{
                                        column.isSorted
                                            ? column.isSortedDesc
                                                ? (<i className="fas fa-arrow-down"></i>)
                                                : (<i className="fas fa-arrow-up"></i>)
                                            : ""
                                    }
                                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {/* {rows.map((row, i) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return (
                                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                    );
                                })}
                            </tr>
                        );
                    })} */}
                    {page.length > 0 ? page.map((row, i) => {
                        prepareRow(row)
                        return (
                            <tr {...row.getRowProps()}>
                                {row.cells.map(cell => {
                                    return <td className="border-solid border-1 border-gray-400 p-0 text-sm capitalize text-center justify-center items-center content-center "{...cell.getCellProps()}>{cell.render('Cell')}</td>
                                })}
                            </tr>
                        )
                    }) : (<tr><td colSpan="14" className="py-5 text-center font-bold bg-gray-300">Data is loading...</td></tr>)}
                </tbody>
            </table>
            <div className="pagination flex justify-between p-3 content-center h-full">
                <div>
                    <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded shadow" onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                        {'<<'}
                    </button>{' '}
                    <button className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded shadow" onClick={() => previousPage()} disabled={!canPreviousPage}>
                        {'<'}
                    </button>{' '}
                    <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded shadow" onClick={() => nextPage()} disabled={!canNextPage}>
                        {'>'}
                    </button>{' '}
                    <button className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded shadow" onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
                        {'>>'}
                    </button>{' '}
                </div>
                <p className="h-full">
                    Page{' '}
                    <strong>
                        {pageIndex + 1} of {pageOptions.length}
                    </strong>{' '}
                </p>
                <span>
                    Go to page:{' '}
                    <input
                        type="number"
                        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
                        defaultValue={pageIndex + 1}
                        onChange={e => {
                            const page = e.target.value ? Number(e.target.value) - 1 : 0
                            gotoPage(page)
                        }}
                        style={{ width: '100px' }}
                    />
                </span>{' '}
                <select
                    className="bg-white text-sm border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value))
                    }}
                >
                    {[5, 10, 20, 30, 40, 50, 100].map(pageSize => (
                        <option key={pageSize} value={pageSize}>
                            Show {pageSize}
                        </option>
                    ))}
                </select>
            </div>
        </>
    );
}