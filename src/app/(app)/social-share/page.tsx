"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
  "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
  "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
  "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialShare() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>(
    "Instagram Square (1:1)"
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalFileType, setOriginalFileType] = useState<string>("");
  const imageRef = useRef<HTMLImageElement | null>(null);
  const router = useRouter();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG file");
      return;
    }

    setOriginalFileType(file.type);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to upload image");
      }

      const data = await response.json();
      setUploadedImage(data.publicId);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConvert = async () => {
    if (!uploadedImage) return;
    setError(null);
    setIsConverting(true);

    try {
      const { width, height } = socialFormats[selectedFormat];
      const format = originalFileType.includes("png") ? "png" : "jpg";
      const transformedUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,f_${format}/${uploadedImage}`;

      const checkResponse = await fetch(transformedUrl, { method: "HEAD" });
      if (!checkResponse.ok) {
        throw new Error("Failed to generate converted image");
      }

      setConvertedImage(transformedUrl);
    } catch (error) {
      console.error("Conversion error:", error);
      setError("Failed to convert image. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = async () => {
    if (!convertedImage) return;
    setError(null);

    try {
      const response = await fetch(convertedImage);
      if (!response.ok) throw new Error("Failed to fetch image");

      const contentType = originalFileType || "image/jpeg";
      const blob = await response.blob();
      const blobWithType = new Blob([blob], { type: contentType });

      const url = window.URL.createObjectURL(blobWithType);
      const link = document.createElement("a");
      link.href = url;

      const extension = contentType.includes("png") ? "png" : "jpg";
      const filename = `social-image-${selectedFormat}.${extension}`;

      console.log("Downloading with:", {
        contentType,
        filename,
        blobSize: blob.size,
        originalFileType,
      });

      link.download = filename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      setError("Failed to download image. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#282a36] text-[#f8f8f2]">
      <aside className="w-full md:w-64 bg-[#44475a] p-6 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <ul>
          <li className="mb-4">
            <button
              onClick={() => router.push("/social-share")}
              className="w-full text-left py-2 px-4 bg-[#6272a4] hover:bg-[#50fa7b] rounded"
            >
              Image Upload
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push("/video-upload")}
              className="w-full text-left py-2 px-4 bg-[#6272a4] hover:bg-[#50fa7b] rounded"
            >
              Video Upload
            </button>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-4 md:p-8 flex flex-col">
        <div className="max-w-4xl mx-auto bg-gray-900 shadow-lg rounded-xl overflow-hidden flex-grow">
          <header className="bg-gray-800 text-white py-4 px-6">
            <h1 className="text-2xl font-bold">Social Media Image Formatter</h1>
            <p className="text-sm text-gray-400">
              Quickly adjust your images for social media!
            </p>
          </header>
          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-2 rounded-md">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Format
              </label>
              <select
                className="select select-bordered w-full bg-gray-800 text-white"
                value={selectedFormat}
                onChange={(e) =>
                  setSelectedFormat(e.target.value as SocialFormat)
                }
              >
                {Object.keys(socialFormats).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Upload Image (JPG or PNG only)
              </label>
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/jpeg,image/jpg,image/png"
                className="file-input file-input-bordered w-full bg-gray-800 text-white"
                disabled={isUploading}
              />
              {isUploading && (
                <p className="mt-2 text-gray-400 text-sm">Uploading...</p>
              )}
            </div>
            {uploadedImage && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Preview</h3>
                <div className="relative bg-gray-700 rounded-lg overflow-hidden">
                  <CldImage
                    ref={imageRef}
                    src={uploadedImage}
                    width={socialFormats[selectedFormat].width}
                    height={socialFormats[selectedFormat].height}
                    alt="Preview"
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button
                    onClick={handleConvert}
                    className="btn btn-primary w-full sm:w-auto"
                    disabled={isConverting}
                  >
                    {isConverting ? "Converting..." : "Convert"}
                  </button>
                  {convertedImage && (
                    <button
                      onClick={handleDownload}
                      className="btn btn-secondary w-full sm:w-auto"
                      disabled={!convertedImage}
                    >
                      Download Image
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
