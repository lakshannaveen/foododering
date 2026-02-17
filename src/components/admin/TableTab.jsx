import React, { useEffect, useState, useMemo } from "react";
import api from "../../index";
import {
  FaPlus,
  FaTable,
  FaQrcode,
  FaDownload,
  FaCheckSquare,
  FaSquare,
  FaSearch,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaFileArchive,
  FaTimes
} from "react-icons/fa";
import { QRCodeCanvas } from "qrcode.react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTables,
  createTable,
} from "../../actions/tableActions";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";

function TableTab() {
  const dispatch = useDispatch();
  const { tables, loading, adding } = useSelector(
    (state) => state.table
  );

  const [newTable, setNewTable] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showQR, setShowQR] = useState({});
  const pageSize = 10;
 
  const backendBaseUrl = api.defaults.baseURL;
  const frontendBaseUrl = import.meta.env.VITE_FRONTEND_BASE_URL || window.location.origin;

  // Fetch tables and menu items on mount
  useEffect(() => {
    dispatch(fetchTables());
    fetchMenuItems();
  }, [dispatch]);

  // Auto-generate QR codes when tables are loaded
  useEffect(() => {
    if (tables && tables.length > 0) {
      const qrMap = {};
      tables.forEach((table) => {
        qrMap[table.TableId] = createQRPayload(table.TableId);
      });
      setShowQR(qrMap);
    }
  }, [tables]);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(
        `${backendBaseUrl}/MenuItem/GetAllMenuItem`
      );
      if (response.data?.ResultSet && response.data.ResultSet.length > 0) {
        setMenuItems(response.data.ResultSet);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchTables());
    setTimeout(() => setRefreshing(false), 500);
  };

  const createQRPayload = (tableId) => {
    return `${frontendBaseUrl}?id=${tableId}`;
  };

  const handleAdd = () => {
    if (!newTable.trim()) return alert("Table name is required!");
    dispatch(createTable({ TableName: newTable }));
    setNewTable("");
  };

  // Generate QR canvas and return as blob
  const generateQRBlob = (tableId, tableName) => {
    return new Promise((resolve) => {
      const qrValue = createQRPayload(tableId);
      const canvas = document.createElement("canvas");

      import("qrcode").then((QRCode) => {
        QRCode.default.toCanvas(
          canvas,
          qrValue,
          {
            width: 512,
            margin: 2,
            color: {
              dark: "#18749b",
              light: "#FFFFFF",
            },
          },
          (error) => {
            if (error) {
              console.error("QR generation error:", error);
              resolve(null);
              return;
            }

            canvas.toBlob((blob) => {
              resolve({
                blob,
                filename: `table-${tableName || tableId}-qr.png`,
              });
            }, "image/png");
          }
        );
      });
    });
  };

  // Bulk download all selected QR codes as ZIP
  const handleDownloadAllQRAsZip = async () => {
    const selectedTableList = tables.filter(
      (table) => selectedTables[table.TableId] && showQR[table.TableId]
    );

    if (selectedTableList.length === 0) {
      alert("Please generate QR codes first for the selected tables.");
      return;
    }

    setBulkDownloading(true);

    try {
      const zip = new JSZip();
      const qrFolder = zip.folder("table-qr-codes");

      // Generate all QR codes and add to ZIP
      for (let i = 0; i < selectedTableList.length; i++) {
        const table = selectedTableList[i];
        const qrData = await generateQRBlob(table.TableId, table.TableName);

        if (qrData && qrData.blob) {
          qrFolder.file(qrData.filename, qrData.blob);
        }
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Download ZIP file
      const timestamp = new Date().toISOString().slice(0, 10);
      saveAs(zipBlob, `table-qr-codes-${timestamp}.zip`);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
      alert("There was an error creating the ZIP file. Please try again.");
    } finally {
      setBulkDownloading(false);
    }
  };

  const handleDownloadQR = (tableId) => {
    const canvas = document.getElementById(`qr-${tableId}`);
    if (!canvas) return;
    const table = tables.find((t) => t.TableId === tableId);
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `table-${table?.TableName || tableId}-qr.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  // Simple filtering based on search term
  const filteredTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    
    return tables.filter((table) => {
      const matchesSearch =
        table.TableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.TableId?.toString().includes(searchTerm);
      return matchesSearch;
    });
  }, [tables, searchTerm]);

  // Paginated tables
  const paginatedTables = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredTables.slice(startIdx, startIdx + pageSize);
  }, [filteredTables, currentPage]);

  return (
    <div>
      {/* Header with Title and Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#18749b] to-[#5A8FD1] rounded-lg flex items-center justify-center">
            <FaTable className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tables</h2>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaSync className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-[#18749b] hover:bg-[#2c5a97] transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredTables.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {Math.min((currentPage - 1) * pageSize + 1, filteredTables.length)} to{" "}
              {Math.min(currentPage * pageSize, filteredTables.length)} of {filteredTables.length} items
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {currentPage}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredTables.length / pageSize), currentPage + 1))}
                disabled={currentPage >= Math.ceil(filteredTables.length / pageSize)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#18749b] border-t-transparent"></div>
          </div>
        )}

        {!loading && filteredTables.length === 0 && (
          <div className="text-center py-12">
            <FaTable className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tables found
            </h3>
            <p className="text-gray-500">
              {tables.length === 0
                ? "No tables have been added yet."
                : "Try adjusting your search."}
            </p>
          </div>
        )}

        {!loading && filteredTables.length > 0 && (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden p-4 space-y-4">
              {paginatedTables.map((table) => (
                <div
                  key={table.TableId}
                  className="p-4 border border-gray-200 rounded-xl hover:border-[#18749b] hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 font-bold text-sm">
                        {table.TableId}
                      </div>
                      <span className="font-medium">{table.TableName}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDownloadQR(table.TableId)}
                      className="px-3 py-1.5 text-xs font-medium text-[#18749b] bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-all flex items-center space-x-1"
                    >
                      <FaDownload className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Table ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedTables.map((table) => (
                    <tr
                      key={table.TableId}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-800 text-sm">
                          {table.TableId}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {table.TableName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="hidden">
                            <QRCodeCanvas
                              id={`qr-${table.TableId}`}
                              value={showQR[table.TableId]}
                              size={256}
                            />
                          </div>
                          <div className="p-2 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                            <QRCodeCanvas
                              value={showQR[table.TableId]}
                              size={40}
                              fgColor="#18749b"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDownloadQR(table.TableId)}
                          className="inline-flex items-center px-3 py-2 text-xs font-medium text-[#18749b] bg-blue-100 border border-blue-300 rounded-lg hover:bg-blue-200 transition-all"
                        >
                          <FaDownload className="w-3 h-3 mr-1" />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Add Table Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Table</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTable("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Table Name
                </label>
                <input
                  type="text"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  placeholder="e.g., Table 1, VIP Table"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18749b] focus:border-[#18749b] transition-all"
                  onKeyPress={(e) => e.key === "Enter" && handleAdd()}
                  autoFocus
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTable("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAdd();
                  setShowAddModal(false);
                }}
                disabled={adding}
                className="px-4 py-2 text-sm font-medium text-white bg-[#18749b] border border-transparent rounded-lg hover:bg-[#2c5a97] focus:ring-2 focus:ring-[#18749b] focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center"
              >
                {adding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  <>
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Table
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TableTab;