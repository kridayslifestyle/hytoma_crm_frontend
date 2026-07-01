import { useEffect, useState } from "react";
import { useMemo } from "react";
import {
  getInventory,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/api";
import { getLeads } from "../services/api";

const CATEGORIES = [
  "Smart Door Lock",
  "Smart Touch Switchboard",
  "Video Door Bell",
  "Sensor",
  "Gate Motor",
  "Curtain Motor & Track",
  "Lights",
  "Other",
];

const PRODUCTS_BY_CATEGORY = {
  "Smart Door Lock": [
    "Face Lock",
    "Motorized Finger Print Lock",
    "Handle With Finger Print Lock",
    "Glass Door Locks",
    "Double Door Locks",
    "Other",
  ],
  "Smart Touch Switchboard": [
    "8 Modular (6S + 1F + 1 Socket)",
    "8 Modular (10S + 4 Scenes)",
    "4 Modular (8 Switches)",
    "4 Modular (10 Switches)",
    "4 Modular (4 Switches + 1 Socket)",
    "2 Modular (4 Switches)",
    "2 Modular (2 Switches)",
    "Other",
  ],
  "Video Door Bell": ["With Screen", "Without Screen", "Other"],
  Sensor: [
    "Motion Sensor",
    "Door Sensor",
    "Steps Light Controller",
    "Single Door wardrobe sensors",
    "Double Door wardrobe sensors",
    "Other",
  ],
  "Gate Motor": ["Gate Motor", "Other"],
  "Curtain Motor & Track": ["Curtain Motor", "Curtain Track", "Other"],
  Lights: ["LED Light", "Smart Light", "Other"],
  Other: ["Other"],
};

const VARIANTS = ["White", "Black", "N/A"];
const SOURCES = ["China", "Kiot", "Areio", "Quicksens", "Glow LED", "Other"];

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [leads, setLeads] = useState([]);
  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    name: "",
    category: "",
    variant: "N/A",
    source: "",
    stock: "",
    price: "",
    description: "",
  });

  useEffect(() => {
    fetchProducts();
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const data = await getLeads();
    setLeads(Array.isArray(data) ? data : []);
  };

  const fetchProducts = async () => {
    const data = await getInventory();
    setProducts(Array.isArray(data) ? data : []);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const bestSelling = useMemo(() => {
    const map = {};

    leads.forEach((lead) => {
      if (!lead.products) return;

      const date = new Date(lead.createdAt);

      const matchMonth =
        dateFilter === "monthly"
          ? selectedMonth && lead.createdAt?.startsWith(selectedMonth)
          : true;

      const matchYear =
        dateFilter === "yearly"
          ? date.getFullYear() === Number(selectedYear)
          : true;

      if (dateFilter === "monthly" && !matchMonth) return;
      if (dateFilter === "yearly" && !matchYear) return;

      lead.products.forEach((p) => {
        if (!map[p.name]) map[p.name] = 0;
        map[p.name] += Number(p.quantity || 1);
      });
    });

    return Object.entries(map)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [leads, dateFilter, selectedMonth, selectedYear]);

  const handleOpenAdd = () => {
    setForm({
      name: "",
      category: "",
      variant: "N/A",
      source: "",
      stock: "",
      price: "",
      description: "",
    });
    setEditProduct(null);
    setShowForm(true);
  };

  const handleOpenEdit = (product) => {
    setForm({
      name: product.name || "",
      category: product.category || "",
      variant: product.variant || "N/A",
      source: product.source || "",
      stock: product.stock || "",
      price: product.price || "",
      description: product.description || "",
    });
    setEditProduct(product);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.source || form.stock === "") {
      showToast("❌ Please fill name, category, source and stock");
      return;
    }
    try {
      if (editProduct) {
        await updateProduct(editProduct._id, form);
        showToast("✅ Product updated");
      } else {
        await addProduct(form);
        showToast("✅ Product added");
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      showToast("❌ Error saving product");
    }
  };

  const handleDelete = async () => {
    await deleteProduct(deleteId);
    setDeleteId(null);
    fetchProducts();
    showToast("✅ Product deleted");
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      (p.name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (p.category?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    const matchesSource = sourceFilter === "all" || p.source === sourceFilter;
    return matchesSearch && matchesCategory && matchesSource;
  });

  // Stats
  const totalStock = products.reduce(
    (sum, p) => sum + (Number(p.stock) || 0),
    0,
  );
  const lowStock = products.filter((p) => Number(p.stock) <= 5).length;

  // Source breakdown
  const sourceStats = SOURCES.map((s) => ({
    name: s,
    count: products.filter((p) => p.source === s).length,
    stock: products
      .filter((p) => p.source === s)
      .reduce((sum, p) => sum + (Number(p.stock) || 0), 0),
  })).filter((s) => s.count > 0);

  // Category breakdown
  const categoryStats = CATEGORIES.map((cat) => ({
    name: cat,
    count: products.filter((p) => p.category === cat).length,
    totalStock: products
      .filter((p) => p.category === cat)
      .reduce((sum, p) => sum + (Number(p.stock) || 0), 0),
  })).filter((c) => c.count > 0);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          Inventory
        </h1>
        <button
          onClick={handleOpenAdd}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-xs">Total Products</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-gray-500 text-xs">Total Stock</p>
          <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow-sm p-4">
          <p className="text-red-500 text-xs">Low Stock</p>
          <p className="text-2xl font-bold text-red-500">{lowStock}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow-sm p-4">
          <p className="text-blue-600 text-xs">Sources</p>
          <p className="text-2xl font-bold text-blue-600">
            {sourceStats.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-5 flex flex-col md:flex-row gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-64"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-auto"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full md:w-auto"
        >
          <option value="all">All Sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-3">
        Showing {filteredProducts.length} product
        {filteredProducts.length !== 1 ? "s" : ""}
      </p>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-x-auto mb-6">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Product Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Variant</th>
              <th className="p-4 text-left">Source</th>
              <th className="p-4 text-left">Stock</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  No products found
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{product.name}</td>
                  <td className="p-4">
                    <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600">
                    {product.variant || "N/A"}
                  </td>
                  <td className="p-4">
                    <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                      {product.source || "—"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : "text-gray-800"}`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4">₹{product.price || "—"}</td>
                  <td className="p-4">
                    {Number(product.stock) === 0 ? (
                      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                        Out of Stock
                      </span>
                    ) : Number(product.stock) <= 5 ? (
                      <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                        Low Stock
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                        In Stock
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleOpenEdit(product)}
                      className="px-3 py-1 border rounded mr-2 text-sm"
                    >
                      Edit
                    </button>
                    {(role === "admin" || role === "inventory_manager") && (
                      <button
                        onClick={() => setDeleteId(product._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3 mb-6">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-10">No products found</p>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-gray-800">{product.name}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                      {product.category}
                    </span>
                    {product.variant && product.variant !== "N/A" && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                        {product.variant}
                      </span>
                    )}
                    {product.source && (
                      <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                        {product.source}
                      </span>
                    )}
                  </div>
                </div>
                {Number(product.stock) === 0 ? (
                  <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                    Out of Stock
                  </span>
                ) : Number(product.stock) <= 5 ? (
                  <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs">
                    Low Stock
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                    In Stock
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Stock</p>
                  <p
                    className={`font-semibold ${Number(product.stock) <= 5 ? "text-red-500" : ""}`}
                  >
                    {product.stock}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-gray-500 text-xs">Price</p>
                  <p className="font-semibold">₹{product.price || "—"}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-600"
                >
                  Edit
                </button>
                {(role === "admin" || role === "inventory_manager") && (
                  <button
                    onClick={() => setDeleteId(product._id)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stock by Source */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">🌍 Stock by Source</h2>
        {sourceStats.length === 0 ? (
          <p className="text-gray-400 text-sm">No data yet</p>
        ) : (
          sourceStats.map((s, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-sm text-gray-500">
                  {s.count} products · {s.stock} units
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((s.stock / Math.max(...sourceStats.map((x) => x.stock), 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stock by Category */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">📦 Stock by Category</h2>
        {categoryStats.length === 0 ? (
          <p className="text-gray-400 text-sm">No products yet</p>
        ) : (
          categoryStats.map((cat, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-sm text-gray-500">
                  {cat.totalStock} units
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((cat.totalStock / Math.max(...categoryStats.map((c) => c.totalStock), 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">🏆 Best Selling Products</h2>

        <div className="flex gap-3 mb-4">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>

          {dateFilter === "monthly" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border px-3 py-2 rounded-lg"
            />
          )}

          {dateFilter === "yearly" && (
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border px-3 py-2 rounded-lg w-32"
            />
          )}
        </div>

        {bestSelling.length === 0 ? (
          <p className="text-gray-400 text-sm">No sales data</p>
        ) : (
          bestSelling.map((p, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <span>{p.name}</span>
              <span className="font-bold text-orange-500">{p.qty} sold</span>
            </div>
          ))
        )}
      </div>

      {/* Product Leaderboard */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h2 className="font-semibold mb-4">🏆 Low Stock Alert</h2>
        {products.filter((p) => Number(p.stock) <= 10).length === 0 ? (
          <p className="text-gray-400 text-sm">All products have good stock</p>
        ) : (
          [...products]
            .filter((p) => Number(p.stock) <= 10)
            .sort((a, b) => (a.stock || 0) - (b.stock || 0))
            .slice(0, 5)
            .map((product, i) => (
              <div
                key={product._id}
                className="flex items-center justify-between border-b py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">
                    {i === 0 ? "🔴" : i === 1 ? "🟠" : "🟡"}
                  </span>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      {product.category} · {product.source}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-red-500">
                  {product.stock} left
                </p>
              </div>
            ))
        )}
      </div>

      {/* ✅ Add/Edit Product Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editProduct ? "Edit Product" : "Add New Product"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Category */}
              <select
                value={form.category}
                required
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value, name: "" })
                }
                className="border px-3 py-2 rounded-lg w-full"
              >
                <option value="" disabled>
                  Select Category
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Product Name — dropdown based on category */}
              {form.category ? (
                <select
                  value={form.name}
                  required
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="border px-3 py-2 rounded-lg w-full"
                >
                  <option value="" disabled>
                    Select Product
                  </option>
                  {(PRODUCTS_BY_CATEGORY[form.category] || []).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  placeholder="Select category first"
                  disabled
                  className="border px-3 py-2 rounded-lg w-full bg-gray-50 text-gray-400"
                />
              )}

              {/* Variant */}
              <select
                value={form.variant}
                onChange={(e) => setForm({ ...form, variant: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full"
              >
                <option value="" disabled>
                  Select Variant / Color
                </option>
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>

              {/* Source */}
              <select
                value={form.source}
                required
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="border px-3 py-2 rounded-lg w-full"
              >
                <option value="" disabled>
                  Select Source / Supplier
                </option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              {/* Stock + Price */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Stock Quantity"
                  value={form.stock}
                  required
                  onChange={(e) =>
                    setForm({ ...form, stock: Number(e.target.value) })
                  }
                  className="border px-3 py-2 rounded-lg w-full"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  className="border px-3 py-2 rounded-lg w-full"
                />
              </div>

              {/* Description */}
              <input
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border px-3 py-2 rounded-lg w-full"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                  {editProduct ? "Update" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Delete Product
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 border rounded-lg text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}
    </div>
  );
}
