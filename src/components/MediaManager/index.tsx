"use client";
import React, { useState, useEffect, ChangeEvent, useRef, DragEvent } from "react";
import api from "@/lib/api";
import SpotlightCard from "@/components/ui/SpotlightCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Trash2,
  Upload,
  File,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Grid,
  List,
  Download,
  Filter,
  Check,
  X,
  Copy,
  FolderOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import clsx from "clsx";

interface MediaFile {
  id: number;
  file: string;
  media_type: string;
  created_at: string;
  file_name?: string;
  file_size?: number;
}

const MediaManager: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<string>("image");
  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [filteredMediaList, setFilteredMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "image" | "video" | "document">("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [dragActive, setDragActive] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch media
  const fetchMedia = async () => {
    try {
      const res = await api.get("/media/list/");
      setMediaList(res.data);
      setFilteredMediaList(res.data);
    } catch (err) {
      toast.error("Failed to load media gallery");
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // ... (rest of the file until the return statement)

  // Filter logic
  useEffect(() => {
    let result = mediaList;

    if (activeFilter !== "ALL") {
      result = result.filter(m => m.media_type === activeFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (media) =>
          media.file.toLowerCase().includes(query) ||
          media.media_type.toLowerCase().includes(query) ||
          (media.file_name && media.file_name.toLowerCase().includes(query))
      );
    }

    setFilteredMediaList(result);
  }, [searchQuery, activeFilter, mediaList]);

  // Upload Logic
  const handleUpload = async (uploadFile: File | null = file) => {
    if (!uploadFile) return;

    // Auto-detect media type if generic
    let finalMediaType = mediaType;
    if (uploadFile.type.startsWith("image/")) finalMediaType = "image";
    else if (uploadFile.type.startsWith("video/")) finalMediaType = "video";
    else if (uploadFile.type.includes("pdf") || uploadFile.type.includes("text")) finalMediaType = "document";

    setLoading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("media_type", finalMediaType);

    try {
      await api.post("/media/upload/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });
      
      toast.success("File uploaded successfully");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchMedia();
    } catch (error) {
        toast.error("Upload failed");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    try {
      await api.delete(`/media/delete/${mediaToDelete.id}/`);
      setMediaList((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
      setMediaToDelete(null);
      setDeleteDialogOpen(false);
      toast.success("File deleted");
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  // Drag and Drop Handlers
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      // Optional: Auto upload on drop
      // handleUpload(droppedFile); 
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "image": return <ImageIcon className="h-5 w-5 text-purple-400" />;
      case "video": return <Video className="h-5 w-5 text-blue-400" />;
      case "document": return <FileText className="h-5 w-5 text-yellow-400" />;
      default: return <File className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-background py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-primary to-purple-600 dark:from-white dark:via-primary dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                    <FolderOpen className="w-8 h-8 text-primary" />
                    Media Manager
                </h1>
                <p className="text-muted-foreground mt-1">
                    Upload, organize, and manage your digital assets.
                </p>
            </div>
            
             <div className="flex items-center gap-4">
               {/* Filters */}
                <div className="flex bg-gray-100 dark:bg-white/5 backdrop-blur-md rounded-xl p-1 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                   {["ALL", "image", "video", "document"].map((filter) => (
                       <button
                           key={filter}
                           onClick={() => setActiveFilter(filter as any)}
                           className={clsx(
                               "relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 capitalize z-0",
                               activeFilter === filter
                               ? "text-gray-900 dark:text-white"
                               : "text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                           )}
                       >
                           {activeFilter === filter && (
                             <motion.div
                               layoutId="active-tab-media"
                               className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm rounded-lg -z-10 border border-gray-200 dark:border-white/5"
                               transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                             />
                           )}
                           {filter}
                       </button>
                   ))}
               </div>

              {/* View Toggle */}
              <div className="flex bg-white dark:bg-white/5 backdrop-blur-md rounded-xl p-1 border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-none">
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={clsx(
                      "relative p-2 rounded-lg transition-colors duration-300 z-0",
                      viewMode === mode ? "text-primary" : "text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    {viewMode === mode && (
                      <motion.div
                        layoutId="active-view-mode"
                        className="absolute inset-0 bg-gray-100 dark:bg-primary/20 rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    {mode === "grid" ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
                  </button>
                ))}
              </div>
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Col: Upload Zone */}
            <div className="lg:col-span-4 space-y-6">
                <SpotlightCard className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/10 overflow-visible shadow-sm dark:shadow-none" disableAnimations>
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">Upload Files</h2>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Drag & Drop</Badge>
                        </div>
                        
                        <div 
                            className={clsx(
                                "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer min-h-[250px]",
                                dragActive 
                                    ? "border-primary bg-primary/5 scale-[1.02]" 
                                    : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5"
                            )}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input 
                                ref={fileInputRef}
                                type="file" 
                                className="hidden" 
                                onChange={(e) => {
                                    if(e.target.files?.[0]) setFile(e.target.files[0]);
                                }}
                            />
                            
                            {file ? (
                                <div className="space-y-4 w-full">
                                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                                        <File className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground truncate max-w-[200px] mx-auto">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                                    </div>
                                    <div className="flex gap-2 justify-center pt-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                                            disabled={loading}
                                            className="bg-primary text-primary-foreground"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                            Upload Now
                                        </Button>
                                    </div>
                                    {loading && <Progress value={uploadProgress} className="h-1" />}
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 ring-1 ring-gray-100 dark:ring-white/10">
                                        <Upload className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
                                    </div>
                                    <h3 className="text-gray-900 dark:text-foreground font-medium mb-1">Drop files here</h3>
                                    <p className="text-sm text-gray-500 dark:text-muted-foreground mb-4">or click to browse</p>
                                    <p className="text-xs text-gray-400 dark:text-muted-foreground/60">Supports images, videos, docs up to 10MB</p>
                                </>
                            )}
                        </div>
                    </div>
                </SpotlightCard>

                {/* Optional: Add storage stats here later */}
            </div>

            {/* Right Col: Media Grid/List */}
            <div className="lg:col-span-8 space-y-6">
                
                {/* Filters Row */}
                <div className="flex items-center gap-4 bg-white dark:bg-black/40 p-2 rounded-xl border border-gray-200 dark:border-white/10 backdrop-blur-sm shadow-sm dark:shadow-none">
                    <Search className="w-5 h-5 text-gray-400 dark:text-muted-foreground ml-2" />
                    <input 
                        className="bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-foreground placeholder:text-gray-400 dark:placeholder:text-muted-foreground flex-1 h-8"
                        placeholder="Search filenames..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="h-8 px-3 flex items-center bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/5 text-xs text-gray-500 dark:text-muted-foreground">
                        {filteredMediaList.length} items
                    </div>
                </div>

                {/* Content View */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                      <AnimatePresence mode="popLayout">
                          {filteredMediaList.map((media) => (
                              <motion.div
                                  key={media.id}
                                  layout
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  transition={{ duration: 0.2 }}
                              >
                                  <SpotlightCard className="h-full bg-white dark:bg-black/40 border-gray-200 dark:border-white/5 group overflow-hidden shadow-sm dark:shadow-none" disableAnimations>
                                      <div className="relative aspect-square bg-gray-50 dark:bg-black/60 flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-white/5">
                                          {media.media_type === "image" ? (
                                              <img 
                                                  src={media.file} 
                                                  alt={media.file_name} 
                                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                              />
                                          ) : (
                                              <div className="scale-150 transition-transform duration-300 group-hover:scale-125">
                                                  {getMediaIcon(media.media_type)}
                                              </div>
                                          )}
                                          
                                          {/* Overlay Actions */}
                                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                              <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border-0 text-white" onClick={() => handleCopyLink(media.file)}>
                                                  <Copy className="h-4 w-4" />
                                              </Button>
                                              <a href={media.file} download target="_blank">
                                                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 border-0 text-white">
                                                      <Download className="h-4 w-4" />
                                                  </Button>
                                              </a>
                                              <Button 
                                                  size="icon" 
                                                  variant="destructive" 
                                                  className="h-8 w-8 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-500 border-0"
                                                  onClick={() => { setMediaToDelete(media); setDeleteDialogOpen(true); }}
                                              >
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </div>
                                      </div>
                                      
                                      <div className="p-3">
                                          <div className="flex items-center gap-2 mb-1">
                                              {getMediaIcon(media.media_type)}
                                              <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate flex-1" title={media.file_name}>
                                                  {media.file_name || "Untitled"}
                                              </p>
                                          </div>
                                          <div className="flex justify-between items-center text-[10px] text-gray-500 dark:text-muted-foreground">
                                              <span>{formatFileSize(media.file_size)}</span>
                                              <span>{new Date(media.created_at).toLocaleDateString()}</span>
                                          </div>
                                      </div>
                                  </SpotlightCard>
                              </motion.div>
                          ))}
                      </AnimatePresence>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredMediaList.map((media) => (
                      <motion.div
                        key={media.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <SpotlightCard className="bg-white dark:bg-black/40 border-gray-200 dark:border-white/5 p-3 flex flex-row items-center justify-between gap-4 group shadow-sm dark:shadow-none" disableAnimations>
                           <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-white/5 flex items-center justify-center border border-gray-200 dark:border-white/5 shrink-0 overflow-hidden">
                                {media.media_type === "image" ? (
                                  <img src={media.file} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  getMediaIcon(media.media_type)
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{media.file_name || "Untitled"}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-muted-foreground mt-0.5">
                                  <span>{formatFileSize(media.file_size)}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="capitalize hidden sm:inline">{media.media_type}</span>
                                  <span>•</span>
                                  <span>{media.created_at ? new Date(media.created_at).toLocaleDateString() : 'Unknown Date'}</span>
                                </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-1 shrink-0">
                              <Button size="icon" variant="ghost" onClick={() => handleCopyLink(media.file)} className="h-8 w-8 text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                <Copy className="w-4 h-4" />
                              </Button>
                              <a href={media.file} download target="_blank">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 dark:text-muted-foreground hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => { setMediaToDelete(media); setDeleteDialogOpen(true); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                           </div>
                        </SpotlightCard>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {filteredMediaList.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                            <Search className="w-6 h-6" />
                        </div>
                        <p>No media files found</p>
                    </div>
                )}
            </div>
        </div>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-white dark:bg-black/90 border-gray-200 dark:border-white/10 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle>Delete File?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. "<strong>{mediaToDelete?.file_name}</strong>" will be permanently removed.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" className="border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete Permanently</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default MediaManager;
