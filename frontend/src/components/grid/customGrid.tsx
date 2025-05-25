import React, { useState, useCallback, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {ClientSideRowModelApiModule, themeQuartz} from "ag-grid-community";
import {
  type GridApi,
  type GridReadyEvent,
  type ColDef,
  ClientSideRowModelModule,
  ModuleRegistry,
  ColumnAutoSizeModule,
} from "ag-grid-community";
import { useTheme } from "@/hooks/useTheme";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  ClientSideRowModelApiModule,
  ColumnAutoSizeModule,
]);

export interface CustomGridProps<T> {
  rowData: T[];
  columnDefs: ColDef[];
  title?: string;
  description?: string;
  height?: string;
  defaultColDef?: ColDef;
  searchText?: string;
  onSearchChange?: (searchText: string) => void;
  enableSearch?: boolean;
  theme?: 'balham' | 'quartz' | 'custom';
  customTheme?: any;
  darkMode?: boolean;
  pagination?: boolean;
  paginationPageSize?: number;
  enableRowSelection?: boolean;
  rowSelectionType?: 'single' | 'multiple';
  suppressCellFocus?: boolean;
  enableCellTextSelection?: boolean;
  onGridReady?: (params: GridReadyEvent) => void;
  onSelectionChanged?: (selectedRows: T[]) => void;
}

function CustomGrid<T>({
  rowData,
  columnDefs,
  title,
  description,
  height = "600px",
  defaultColDef: propDefaultColDef,
  searchText = "",
  onSearchChange,
  enableSearch = true,
  theme = 'quartz',
  customTheme,
  pagination = true,
  paginationPageSize = 10,
  enableRowSelection = true,
  rowSelectionType = 'multiple',
  suppressCellFocus = true,
  enableCellTextSelection = true,
  onGridReady: propOnGridReady,
  onSelectionChanged,
}: CustomGridProps<T>) {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [innerSearchText, setInnerSearchText] = useState(searchText);
  const {theme: themeMode} = useTheme();

  useEffect(() => {
    setInnerSearchText(searchText);
  }, [searchText]);

  useEffect(() => {
    if (gridApi && enableSearch) {
      gridApi.setGridOption('quickFilterText', innerSearchText);
    }
  }, [innerSearchText, gridApi, enableSearch]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInnerSearchText(newValue);
      if (onSearchChange) {
        onSearchChange(newValue);
      }
    },
    [onSearchChange]
  );

  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    
    if (propOnGridReady) {
      propOnGridReady(params);
    }
  }, [propOnGridReady]);

  const handleSelectionChanged = useCallback(() => {
    if (gridApi && onSelectionChanged) {
      const selectedRows = gridApi.getSelectedRows();
      onSelectionChanged(selectedRows as T[]);
    }
  }, [gridApi, onSelectionChanged]);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      suppressMovable: true,
      ...propDefaultColDef,
    }),
    [propDefaultColDef]
  );

  
  const gridTheme = useMemo(() => {
    if (customTheme) {
      return customTheme;
    }
    
    return themeQuartz.withParams({
      backgroundColor: "transparent",
      spacing:12,
      browserColorScheme: themeMode,
      chromeBackgroundColor: {
        ref: "foregroundColor",
        mix: 0.07,
        onto: "backgroundColor"
      },
      foregroundColor: themeMode == "dark" || themeMode === "system" ? "#8A8A8A" : "#262626",
      headerFontSize: 14
    });
  }, [theme, themeMode, customTheme]);

  return (
    <div className="w-full">
      {(title || description || enableSearch) && (
        <div className="pb-3">
          <div className="flex justify-between items-center">
            {(title || description) && (
              <div>
                {title && <h3 className="text-lg font-semibold">{title}</h3>}
                {description && <p className="text-sm text-gray-500">{description}</p>}
              </div>
            )}
            {enableSearch && (
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search..."
                  value={innerSearchText}
                  onChange={handleSearchChange}
                  className="w-full px-4 py-2 pr-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div style={{ height, width: "100%" }}>
        <AgGridReact
          theme={gridTheme}
          modules={[ClientSideRowModelModule, ColumnAutoSizeModule]}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows={true}
          rowSelection={enableRowSelection ? rowSelectionType : undefined}
          onSelectionChanged={handleSelectionChanged}
          pagination={pagination}
          paginationPageSize={paginationPageSize}
          suppressCellFocus={suppressCellFocus}
          enableCellTextSelection={enableCellTextSelection}
          loadingOverlayComponent="loadingOverlayComponent"
          loadingOverlayComponentParams={{ loadingMessage: "Loading data..." }}
          suppressRowVirtualisation={false}
          rowBuffer={10}
          cacheQuickFilter={false}
        />
      </div>
    </div>
  );
}

export default CustomGrid;