import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Ruler,
  Scale,
  Shield,
  Thermometer,
  Droplets,
  Lightbulb,
  FileText,
  History,
  Tag,
  User,
  Calendar,
  Package,
  MapPin,
  Save,
} from "lucide-react";
import { useAppStore } from "../store";
import { ARTWORK_CATEGORIES, type Artwork, type ArtworkStatus } from "../types";
import { artworkStatusLabel, artworkStatusColor, formatCurrency, cn } from "../utils";
import { StatusBadge } from "../components/shared/StatusBadge";

type StatusFilter = "all" | ArtworkStatus;
type CategoryFilter = "all" | string;

export default function Artworks() {
  const artworks = useAppStore((state) => state.artworks);
  const addArtwork = useAppStore((state) => state.addArtwork);
  const applications = useAppStore((state) => state.applications);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    author: "",
    year: "",
    material: "",
    category: ARTWORK_CATEGORIES[0],
    height_cm: "",
    width_cm: "",
    depth_cm: "",
    weight_kg: "",
    insurance_value: "",
    temperature: "",
    humidity: "",
    light: "",
    notes: "",
    description: "",
    accession_no: "",
  });

  const filteredArtworks = useMemo(() => {
    return artworks.filter((artwork) => {
      const matchesKeyword =
        !keyword ||
        artwork.name.toLowerCase().includes(keyword.toLowerCase()) ||
        artwork.author.toLowerCase().includes(keyword.toLowerCase()) ||
        artwork.accession_no.toLowerCase().includes(keyword.toLowerCase());
      const matchesStatus = statusFilter === "all" || artwork.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || artwork.category === categoryFilter;
      return matchesKeyword && matchesStatus && matchesCategory;
    });
  }, [artworks, keyword, statusFilter, categoryFilter]);

  const handleSelectArtwork = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setCarouselIndex(0);
  };

  const handleCloseDrawer = () => {
    setSelectedArtwork(null);
    setCarouselIndex(0);
  };

  const handlePrevImage = () => {
    if (!selectedArtwork) return;
    setCarouselIndex((prev) =>
      prev === 0 ? selectedArtwork.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!selectedArtwork) return;
    setCarouselIndex((prev) =>
      prev === selectedArtwork.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addArtwork({
      name: formData.name,
      author: formData.author,
      year: formData.year,
      material: formData.material,
      category: formData.category,
      height_cm: parseFloat(formData.height_cm) || 0,
      width_cm: parseFloat(formData.width_cm) || 0,
      depth_cm: formData.depth_cm ? parseFloat(formData.depth_cm) : undefined,
      weight_kg: parseFloat(formData.weight_kg) || 0,
      insurance_value: parseFloat(formData.insurance_value) || 0,
      storage_condition: {
        temperature: formData.temperature,
        humidity: formData.humidity,
        light: formData.light,
        notes: formData.notes || undefined,
      },
      images: [
        `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
          formData.name + " " + formData.category + " artwork museum"
        )}&image_size=portrait_4_3`,
      ],
      status: "available",
      description: formData.description || undefined,
      accession_no: formData.accession_no,
    });
    setFormData({
      name: "",
      author: "",
      year: "",
      material: "",
      category: ARTWORK_CATEGORIES[0],
      height_cm: "",
      width_cm: "",
      depth_cm: "",
      weight_kg: "",
      insurance_value: "",
      temperature: "",
      humidity: "",
      light: "",
      notes: "",
      description: "",
      accession_no: "",
    });
    setShowCreateForm(false);
  };

  const getBorrowHistoryDetails = (historyIds: string[]) => {
    return historyIds
      .map((id) => applications.find((app) => app.id === id))
      .filter(Boolean);
  };

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">展品档案</h1>
            <p className="section-subtitle">管理馆藏艺术品的完整信息与借展记录</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-gallery-primary flex items-center gap-2"
          >
            <Plus size={16} />
            新建作品
          </button>
        </div>

        <div className="card-gallery p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
              />
              <input
                type="text"
                placeholder="搜索作品名称、作者或馆藏编号..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="input-gallery pl-10"
              />
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Filter
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input-gallery pl-9 pr-8 appearance-none cursor-pointer min-w-[140px]"
                >
                  <option value="all">全部分类</option>
                  {ARTWORK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="input-gallery pr-8 appearance-none cursor-pointer min-w-[140px]"
              >
                <option value="all">全部状态</option>
                <option value="available">在库可借</option>
                <option value="on_loan">借出中</option>
                <option value="restoring">修复中</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-ink/50">
            共找到 <span className="font-medium text-ink">{filteredArtworks.length}</span> 件作品
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              onClick={() => handleSelectArtwork(artwork)}
              className="card-gallery cursor-pointer overflow-hidden group animate-slide-up"
            >
              <div className="relative aspect-[4/3] bg-ink-50 overflow-hidden">
                {artwork.images[0] ? (
                  <img
                    src={artwork.images[0]}
                    alt={artwork.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/30">
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <StatusBadge
                    label={artworkStatusLabel[artwork.status]}
                    className={artworkStatusColor[artwork.status]}
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-lg font-semibold text-ink mb-1 truncate">
                  {artwork.name}
                </h3>
                <div className="flex items-center gap-1 text-sm text-ink/60 mb-2">
                  <User size={12} />
                  <span className="truncate">{artwork.author}</span>
                  <span className="text-ink/30">·</span>
                  <Calendar size={12} />
                  <span>{artwork.year}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="tag-gallery bg-gold-50 text-gold-500 border-gold-200 border">
                    <Tag size={10} className="mr-1" />
                    {artwork.category}
                  </span>
                  <span className="tag-gallery bg-ink-50 text-ink-500 border-ink-100 border">
                    <Ruler size={10} className="mr-1" />
                    {artwork.height_cm}×{artwork.width_cm}cm
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredArtworks.length === 0 && (
          <div className="card-gallery p-16 text-center">
            <ImageIcon size={48} className="mx-auto text-ink/20 mb-4" />
            <p className="text-ink/50">未找到符合条件的作品</p>
          </div>
        )}
      </div>

      {selectedArtwork && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={handleCloseDrawer}
          />
          <div className="relative w-full max-w-2xl bg-cream-50 shadow-gallery-lg animate-slide-in-right overflow-y-auto scrollbar-thin">
            <div className="sticky top-0 z-10 bg-cream-50/95 backdrop-blur-sm border-b border-ink/10 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {selectedArtwork.name}
                </h2>
                <p className="text-xs text-ink/50">馆藏编号：{selectedArtwork.accession_no}</p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="btn-gallery-ghost p-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative aspect-[4/3] bg-ink-50 group">
              <img
                src={selectedArtwork.images[carouselIndex]}
                alt={selectedArtwork.name}
                className="w-full h-full object-contain"
              />
              {selectedArtwork.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink/50 text-cream opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/70"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink/50 text-cream opacity-0 group-hover:opacity-100 transition-opacity hover:bg-ink/70"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {selectedArtwork.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          idx === carouselIndex
                            ? "bg-gold-400 w-6"
                            : "bg-white/50 hover:bg-white/80"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-ink mb-1">
                    {selectedArtwork.name}
                  </h3>
                  <p className="text-ink/60">{selectedArtwork.author}</p>
                </div>
                <StatusBadge
                  label={artworkStatusLabel[selectedArtwork.status]}
                  className={cn(artworkStatusColor[selectedArtwork.status], "text-sm px-3 py-1")}
                />
              </div>

              {selectedArtwork.description && (
                <div className="card-gallery p-4">
                  <p className="text-sm text-ink/70 leading-relaxed">
                    {selectedArtwork.description}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-ink/80 mb-3 flex items-center gap-2">
                  <FileText size={14} className="text-gold-500" />
                  基本信息
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="card-gallery p-3">
                    <div className="text-xs text-ink/50 mb-1 flex items-center gap-1">
                      <Calendar size={12} />
                      创作年代
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {selectedArtwork.year}
                    </div>
                  </div>
                  <div className="card-gallery p-3">
                    <div className="text-xs text-ink/50 mb-1 flex items-center gap-1">
                      <Tag size={12} />
                      作品分类
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {selectedArtwork.category}
                    </div>
                  </div>
                  <div className="card-gallery p-3">
                    <div className="text-xs text-ink/50 mb-1 flex items-center gap-1">
                      <Package size={12} />
                      材质工艺
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {selectedArtwork.material}
                    </div>
                  </div>
                  <div className="card-gallery p-3">
                    <div className="text-xs text-ink/50 mb-1 flex items-center gap-1">
                      <Ruler size={12} />
                      尺寸
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {selectedArtwork.height_cm} × {selectedArtwork.width_cm}
                      {selectedArtwork.depth_cm
                        ? ` × ${selectedArtwork.depth_cm} cm`
                        : " cm"}
                    </div>
                  </div>
                  <div className="card-gallery p-3">
                    <div className="text-xs text-ink/50 mb-1 flex items-center gap-1">
                      <Scale size={12} />
                      重量
                    </div>
                    <div className="text-sm font-medium text-ink">
                      {selectedArtwork.weight_kg} kg
                    </div>
                  </div>
                  <div className="card-gallery p-3">
                    <div className="text-xs text-ink/50 mb-1 flex items-center gap-1">
                      <Shield size={12} />
                      保险估值
                    </div>
                    <div className="text-sm font-medium text-gold-500">
                      {formatCurrency(selectedArtwork.insurance_value)}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink/80 mb-3 flex items-center gap-2">
                  <Thermometer size={14} className="text-gold-500" />
                  保存条件
                </h4>
                <div className="card-gallery p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-ink/60">
                      <Thermometer size={14} className="text-terracotta-400" />
                      温度
                    </div>
                    <span className="text-sm font-medium text-ink">
                      {selectedArtwork.storage_condition.temperature}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-ink/60">
                      <Droplets size={14} className="text-slate-400" />
                      湿度
                    </div>
                    <span className="text-sm font-medium text-ink">
                      {selectedArtwork.storage_condition.humidity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-ink/60">
                      <Lightbulb size={14} className="text-gold-400" />
                      光照
                    </div>
                    <span className="text-sm font-medium text-ink">
                      {selectedArtwork.storage_condition.light}
                    </span>
                  </div>
                  {selectedArtwork.storage_condition.notes && (
                    <div className="pt-2 border-t border-ink/10">
                      <p className="text-xs text-ink/50 mb-1">备注</p>
                      <p className="text-sm text-ink/70">
                        {selectedArtwork.storage_condition.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink/80 mb-3 flex items-center gap-2">
                  <History size={14} className="text-gold-500" />
                  借展历史
                  <span className="text-xs text-ink/40 font-normal">
                    共 {selectedArtwork.borrow_history.length} 次
                  </span>
                </h4>
                {selectedArtwork.borrow_history.length > 0 ? (
                  <div className="space-y-2">
                    {getBorrowHistoryDetails(selectedArtwork.borrow_history).map(
                      (app) =>
                        app && (
                          <div key={app.id} className="card-gallery p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-ink text-sm">
                                  {app.exhibition_name}
                                </p>
                                <p className="text-xs text-ink/50 mt-0.5">
                                  {app.borrower_name}
                                </p>
                              </div>
                              <StatusBadge
                                label={
                                  app.status === "approved"
                                    ? "已批准"
                                    : app.status === "pending"
                                    ? "待审批"
                                    : "已拒绝"
                                }
                                className={
                                  app.status === "approved"
                                    ? "bg-moss-50 text-moss-400 border-moss-200"
                                    : app.status === "pending"
                                    ? "bg-gold-50 text-gold-400 border-gold-200"
                                    : "bg-terracotta-50 text-terracotta-400 border-terracotta-200"
                                }
                              />
                            </div>
                            <div className="flex items-center gap-3 text-xs text-ink/50">
                              <span className="flex items-center gap-1">
                                <Calendar size={10} />
                                {app.start_date} 至 {app.end_date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={10} />
                                {app.venue_address.slice(0, 20)}...
                              </span>
                            </div>
                          </div>
                        )
                    )}
                  </div>
                ) : (
                  <div className="card-gallery p-8 text-center">
                    <History size={32} className="mx-auto text-ink/20 mb-2" />
                    <p className="text-sm text-ink/50">暂无借展记录</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowCreateForm(false)}
          />
          <div className="relative w-full max-w-xl bg-cream-50 shadow-gallery-lg animate-slide-in-right overflow-y-auto scrollbar-thin">
            <div className="sticky top-0 z-10 bg-cream-50/95 backdrop-blur-sm border-b border-ink/10 px-6 py-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">新建作品档案</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-gallery-ghost p-2"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-gallery">作品名称 *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-gallery"
                    required
                  />
                </div>
                <div>
                  <label className="label-gallery">作者 *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    className="input-gallery"
                    required
                  />
                </div>
                <div>
                  <label className="label-gallery">创作年代 *</label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="input-gallery"
                    required
                  />
                </div>
                <div>
                  <label className="label-gallery">馆藏编号 *</label>
                  <input
                    type="text"
                    name="accession_no"
                    value={formData.accession_no}
                    onChange={handleInputChange}
                    className="input-gallery"
                    required
                  />
                </div>
                <div>
                  <label className="label-gallery">作品分类 *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-gallery appearance-none cursor-pointer"
                    required
                  >
                    {ARTWORK_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="label-gallery">材质工艺 *</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    className="input-gallery"
                    required
                  />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink/80 mb-3 flex items-center gap-2">
                  <Ruler size={14} className="text-gold-500" />
                  物理规格
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-gallery">高度 (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="height_cm"
                      value={formData.height_cm}
                      onChange={handleInputChange}
                      className="input-gallery"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-gallery">宽度 (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      name="width_cm"
                      value={formData.width_cm}
                      onChange={handleInputChange}
                      className="input-gallery"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-gallery">深度 (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="depth_cm"
                      value={formData.depth_cm}
                      onChange={handleInputChange}
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">重量 (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      name="weight_kg"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                      className="input-gallery"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="label-gallery">保险估值 (元) *</label>
                    <input
                      type="number"
                      name="insurance_value"
                      value={formData.insurance_value}
                      onChange={handleInputChange}
                      className="input-gallery"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-ink/80 mb-3 flex items-center gap-2">
                  <Thermometer size={14} className="text-gold-500" />
                  保存条件
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="label-gallery">温度</label>
                    <input
                      type="text"
                      name="temperature"
                      placeholder="如 18-22℃"
                      value={formData.temperature}
                      onChange={handleInputChange}
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">湿度</label>
                    <input
                      type="text"
                      name="humidity"
                      placeholder="如 50-60%"
                      value={formData.humidity}
                      onChange={handleInputChange}
                      className="input-gallery"
                    />
                  </div>
                  <div>
                    <label className="label-gallery">光照</label>
                    <input
                      type="text"
                      name="light"
                      placeholder="如 ≤50lux"
                      value={formData.light}
                      onChange={handleInputChange}
                      className="input-gallery"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="label-gallery">保存备注</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="input-gallery resize-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-gallery">作品描述</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-gallery resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-ink/10">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-gallery flex-1"
                >
                  取消
                </button>
                <button type="submit" className="btn-gallery-primary flex-1 flex items-center justify-center gap-2">
                  <Save size={16} />
                  保存档案
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
