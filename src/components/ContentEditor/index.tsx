"use client";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  Save,
  FileJson,
  FolderOpen,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Image as ImageIcon,
  User,
  RefreshCw,
  AlertCircle,
  X,
  Type,
  Link as LinkIcon,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence, Reorder, useDragControls, LayoutGroup } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";

// Types
interface ContentCategory {
  id: string;
  name: string;
  files: { name: string; displayName: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContentData = Record<string, any>;

// Drag handle component with 6-dot grid pattern
const DragHandle = ({ dragControls }: { dragControls: ReturnType<typeof useDragControls> }) => (
  <div
    className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
    onPointerDown={(e) => dragControls.start(e)}
  >
    <div className="grid grid-cols-2 gap-[3px]">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500" />
      ))}
    </div>
  </div>
);

const ContentEditor: React.FC = () => {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [content, setContent] = useState<ContentData | null>(null);
  const [originalContent, setOriginalContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    sectionKey: string;
    index: number;
    name: string;
  } | null>(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/content/list/");
      setCategories(res.data);
      if (res.data.length > 0) {
        setSelectedCategory(res.data[0].id);
        if (res.data[0].files.length > 0) {
          setSelectedFile(res.data[0].files[0].name);
        }
      }
    } catch (err) {
      toast.error("Failed to load content categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch content when file is selected
  const fetchContent = async () => {
    if (!selectedCategory || !selectedFile) return;

    setLoading(true);
    try {
      const res = await api.get(
        `/content/read/?category=${selectedCategory}&file=${selectedFile}`
      );
      setContent(res.data.content);
      setOriginalContent(JSON.parse(JSON.stringify(res.data.content)));
      setHasChanges(false);
    } catch (err) {
      toast.error("Failed to load content");
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedFile) {
      fetchContent();
    }
  }, [selectedCategory, selectedFile]);

  // Check for changes
  useEffect(() => {
    if (content && originalContent) {
      setHasChanges(JSON.stringify(content) !== JSON.stringify(originalContent));
    }
  }, [content, originalContent]);

  // Save content
  const handleSave = async () => {
    if (!selectedCategory || !selectedFile || !content) return;

    setSaving(true);
    try {
      await api.post("/content/update/", {
        category: selectedCategory,
        file: selectedFile,
        content: content,
      });
      setOriginalContent(JSON.parse(JSON.stringify(content)));
      setHasChanges(false);
      toast.success("Content saved successfully!");
    } catch (err) {
      toast.error("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  // Update any field in an array item
  const updateArrayField = (
    sectionKey: string,
    index: number,
    field: string,
    value: string
  ) => {
    if (!content) return;

    const newContent = { ...content };
    const section = newContent[sectionKey];
    if (Array.isArray(section) && section[index]) {
      section[index] = { ...section[index], [field]: value };
      setContent({ ...newContent });
    }
  };

  // Update a top-level string field
  const updateStringField = (key: string, value: string) => {
    if (!content) return;
    setContent({ ...content, [key]: value });
  };

  // Update nested object field
  const updateNestedField = (parentKey: string, field: string, value: string) => {
    if (!content) return;
    const newContent = { ...content };
    if (typeof newContent[parentKey] === "object" && !Array.isArray(newContent[parentKey])) {
      newContent[parentKey] = { ...newContent[parentKey], [field]: value };
      setContent(newContent);
    }
  };

  // Update nested array item (like headline.parts)
  const updateNestedArrayField = (
    parentKey: string,
    arrayKey: string,
    index: number,
    field: string,
    value: string
  ) => {
    if (!content) return;
    const newContent = { ...content };
    if (newContent[parentKey]?.[arrayKey]?.[index]) {
      newContent[parentKey][arrayKey][index] = {
        ...newContent[parentKey][arrayKey][index],
        [field]: value,
      };
      setContent({ ...newContent });
    }
  };

  // Handle reorder of array items
  const handleReorder = (sectionKey: string, newOrder: Record<string, unknown>[]) => {
    if (!content) return;
    const newContent = { ...content, [sectionKey]: newOrder };
    setContent(newContent);
  };

  // Add new item to array
  const addArrayItem = (sectionKey: string, template: Record<string, string>) => {
    if (!content) return;

    const newContent = { ...content };
    const section = newContent[sectionKey];
    if (Array.isArray(section)) {
      section.push({ ...template });
      setContent({ ...newContent });
    }
  };

  // Delete item from array
  const deleteArrayItem = () => {
    if (!content || !itemToDelete) return;

    const { sectionKey, index } = itemToDelete;
    const newContent = { ...content };
    const section = newContent[sectionKey];
    if (Array.isArray(section)) {
      section.splice(index, 1);
      setContent({ ...newContent });
    }
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    toast.success("Item removed");
  };

  // Discard changes
  const discardChanges = () => {
    if (originalContent) {
      setContent(JSON.parse(JSON.stringify(originalContent)));
      setHasChanges(false);
      toast.info("Changes discarded");
    }
  };

  // Get icon for field type
  const getFieldIcon = (fieldName: string) => {
    if (fieldName.includes("image") || fieldName.includes("icon")) {
      return <ImageIcon className="w-3 h-3 text-purple-400" />;
    }
    if (fieldName.includes("url") || fieldName.includes("href") || fieldName.includes("action")) {
      return <LinkIcon className="w-3 h-3 text-blue-400" />;
    }
    return <Type className="w-3 h-3 text-gray-400" />;
  };

  // Get display name for a field
  const getDisplayLabel = (item: Record<string, unknown>): string => {
    // Try common name fields
    if (item.name) return String(item.name);
    if (item.title) return String(item.title);
    if (item.text) return String(item.text);
    if (item.label) return String(item.label);
    // Fallback to first string value
    const firstString = Object.values(item).find((v) => typeof v === "string");
    return firstString ? String(firstString).slice(0, 30) : "Item";
  };



  // Draggable Item Component
  const DraggableItem = ({
    item,
    sectionKey,
    index,
  }: {
    item: Record<string, unknown>;
    sectionKey: string;
    index: number;
  }) => {
    const dragControls = useDragControls();
    
    // Get preview fields
    const title = item.title || item.name || item.heading || "Untitled Item";
    const subtitle = item.role || item.description || item.category || "";
    const image = item.image || item.icon || item.avatar;

    return (
      <Reorder.Item
        value={item}
        id={`${sectionKey}-${index}`}
        dragListener={false}
        dragControls={dragControls}
        style={{ position: "relative" }}
        whileDrag={{
          scale: 1.02,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)",
          zIndex: 50
        }}
        className="group relative bg-white dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 transition-all hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <DragHandle dragControls={dragControls} />
          
          {/* Image Preview */}
          <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/10 overflow-hidden flex items-center justify-center shrink-0 border border-gray-200 dark:border-white/10 ml-6">
            {image ? (
              <img
                src={String(image)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="text-lg">📄</div>
            )}
          </div>

          {/* Content Summary */}
          <div className="flex-1 min-w-0 py-1">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {String(title)}
            </h4>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {String(subtitle).slice(0, 50)}
                {String(subtitle).length > 50 ? "..." : ""}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingItem({ sectionKey, index, item })}
              className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setItemToDelete({ sectionKey, index, name: String(title) });
                setDeleteDialogOpen(true);
              }}
              className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Reorder.Item>
    );
  };

  // ... (rest of the component)

  // Add state for editing
  const [editingItem, setEditingItem] = useState<{
    sectionKey: string;
    index: number;
    item: Record<string, any>;
  } | null>(null);

  // Edit Dialog
  const EditDialog = () => {
    const [formData, setFormData] = useState<Record<string, any>>({});

    useEffect(() => {
      if (editingItem) {
        setFormData(JSON.parse(JSON.stringify(editingItem.item)));
      }
    }, [editingItem]);

    const handleSave = () => {
      if (!content || !editingItem) return;
      
      const newContent = { ...content };
      const section = newContent[editingItem.sectionKey];
      if (Array.isArray(section)) {
        section[editingItem.index] = formData;
        setContent(newContent);
      }
      setEditingItem(null);
    };

    if (!editingItem) return null;

    return (
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-white/10 max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {Object.entries(formData).map(([key, value]) => {
              if (key === "id") return null;
              const label = key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

              // Arrays
              if (Array.isArray(value)) {
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <div className="space-y-2">
                      {value.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={String(item)}
                            onChange={(e) => {
                              const newArr = [...value];
                              newArr[idx] = e.target.value;
                              setFormData(prev => ({ ...prev, [key]: newArr }));
                            }}
                            className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              const newArr = value.filter((_, i) => i !== idx);
                              setFormData(prev => ({ ...prev, [key]: newArr }));
                            }}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFormData(prev => ({ ...prev, [key]: [...value, ""] }))}
                        className="w-full border-dashed"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add Item
                      </Button>
                    </div>
                  </div>
                );
              }

              // Long Text
              if (key.toLowerCase().includes("description") || (typeof value === "string" && value.length > 50)) {
                return (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <textarea
                      value={value}
                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm focus:border-primary/50 outline-none"
                    />
                  </div>
                );
              }

              return (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                  <Input
                    value={value || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    className="bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10"
                  />
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Render all content sections
  const renderContent = () => {
    if (!content) return null;

    return Object.entries(content).map(([key, value]) => {
      // Handle arrays (like team members, services, buttons)
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "object") {
        const items = value as Record<string, unknown>[];
        const sectionTitle = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Create template for new items based on first item's structure
        const template: Record<string, string> = {};
        Object.keys(items[0]).forEach((k) => {
          if (typeof items[0][k] === "string") {
            template[k] = "";
          }
        });

        return (
          <div key={key} className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {sectionTitle}
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                >
                  {items.length} items
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => addArrayItem(key, template)}
                className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 dark:shadow-emerald-500/10 border-0"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            <Reorder.Group
              axis="y"
              values={items}
              onReorder={(newOrder) => handleReorder(key, newOrder)}
              className="space-y-3"
              layoutScroll
            >
              {items.map((item, index) => {
                // Create a stable key based on item content
                const itemKey = (item.name || item.title || item.text || JSON.stringify(item).slice(0, 50)) + '-' + index;
                return (
                  <DraggableItem
                    key={itemKey}
                    item={item}
                    sectionKey={key}
                    index={items.indexOf(item)}
                  />
                );
              })}
            </Reorder.Group>
          </div>
        );
      }

      // Handle simple string fields (like description)
      if (typeof value === "string") {
        return (
          <div key={key} className="mb-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
            <textarea
              value={value}
              onChange={(e) => updateStringField(key, e.target.value)}
              className="w-full min-h-[80px] p-3 text-sm rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white resize-y placeholder:text-gray-400 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder={key}
            />
          </div>
        );
      }

      // Handle nested objects (like headline with parts array)
      if (typeof value === "object" && !Array.isArray(value) && value !== null) {
        const nestedObj = value as Record<string, unknown>;
        return (
          <div key={key} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </h3>
            <div className="pl-4 border-l-2 border-gray-200 dark:border-white/10 space-y-4">
              {Object.entries(nestedObj).map(([nestedKey, nestedValue]) => {
                // Nested array (like headline.parts)
                if (Array.isArray(nestedValue) && nestedValue.length > 0) {
                  return (
                    <div key={nestedKey} className="space-y-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {nestedKey.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      {nestedValue.map((item: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-gray-50 dark:bg-white/5 p-2 rounded-lg">
                          {Object.entries(item).map(([fieldKey, fieldVal]) => (
                            <Input
                              key={fieldKey}
                              value={String(fieldVal)}
                              onChange={(e) =>
                                updateNestedArrayField(key, nestedKey, idx, fieldKey, e.target.value)
                              }
                              placeholder={fieldKey}
                              className="h-8 text-sm flex-1 bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  );
                }

                // Simple nested string
                if (typeof nestedValue === "string") {
                  return (
                    <div key={nestedKey} className="flex items-center gap-3">
                      <span className="text-sm text-gray-500 dark:text-gray-400 w-24 shrink-0">
                        {nestedKey}
                      </span>
                      <Input
                        value={nestedValue}
                        onChange={(e) => updateNestedField(key, nestedKey, e.target.value)}
                        className="h-8 text-sm bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        );
      }

      return null;
    });
  };

  const currentCategory = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen w-full bg-background py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <EditDialog />
      {/* Ambient background effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <FileJson className="w-8 h-8 text-primary" />
              Content Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Edit team members, profile pictures, and content displayed on the
              portal.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {hasChanges && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2"
              >
                <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Unsaved changes
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={discardChanges}
                  className="h-9 border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white"
                >
                  <X className="w-4 h-4 mr-1" /> Discard
                </Button>
              </motion.div>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={clsx(
                "h-9 shadow-lg transition-all font-medium",
                hasChanges
                  ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white shadow-primary/25"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shadow-none cursor-not-allowed"
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar: Categories & Files */}
          <div className="lg:col-span-3 space-y-4">
            <SpotlightCard
              className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 overflow-visible shadow-sm dark:shadow-none"
              disableAnimations
            >
              <div className="p-4">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-foreground mb-4 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  Content Files
                </h2>

                <LayoutGroup>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(category.id);
                          if (category.files.length > 0) {
                            setSelectedFile(category.files[0].name);
                          }
                        }}
                        className={clsx(
                          "w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                          selectedCategory === category.id
                            ? "bg-primary/10 text-primary"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                        )}
                      >
                        <ChevronRight
                          className={clsx(
                            "w-4 h-4 transition-transform",
                            selectedCategory === category.id && "rotate-90"
                          )}
                        />
                        {category.name}
                      </button>

                      {selectedCategory === category.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="ml-6 mt-1 space-y-1"
                        >
                          {category.files.map((file) => (
                            <button
                              key={file.name}
                              onClick={() => setSelectedFile(file.name)}
                              className={clsx(
                                "relative w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2",
                                selectedFile === file.name
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"
                              )}
                            >
                              {selectedFile === file.name && (
                                <motion.span
                                  layoutId="active-file-pill"
                                  className="absolute inset-0 bg-primary/15 dark:bg-white/15 border-2 border-primary/40 dark:border-white/20 rounded-md shadow-sm"
                                  style={{ zIndex: 0 }}
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}
                              <FileJson className="w-3 h-3" />
                              {file.displayName}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
                </LayoutGroup>
              </div>
            </SpotlightCard>
          </div>

          {/* Right Content: Editor */}
          <div className="lg:col-span-9">
            <SpotlightCard
              className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 overflow-visible shadow-sm dark:shadow-none min-h-[600px]"
              disableAnimations
            >
              <div className="p-6">
                {/* File Header */}
                {selectedFile && (
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileJson className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedFile.replace(".json", "").replace(/_/g, " ")}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {currentCategory?.name} / {selectedFile}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={fetchContent}
                      className="h-8 text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                  </div>
                )}

                {/* Loading State */}
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : content ? (
                  <div>{renderContent()}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <FileJson className="w-12 h-12 mb-3 opacity-50" />
                    <p>Select a file to edit</p>
                  </div>
                )}
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white dark:bg-black/90 border-gray-200 dark:border-white/10 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Remove Item?</DialogTitle>
              <DialogDescription>
                This will remove &quot;<strong>{itemToDelete?.name}</strong>&quot; from
                this section. This change will only take effect after you save.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                className="border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={deleteArrayItem}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

};

export default ContentEditor;
