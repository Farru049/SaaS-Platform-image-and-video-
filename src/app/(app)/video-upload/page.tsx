'use client';

import React, { useState, useCallback } from 'react';
import { UploadCloud } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

interface UploadProgress {
  started: boolean;
  progress: number;
}

const VideoUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    started: false,
    progress: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [compressedVideoUrl, setCompressedVideoUrl] = useState<string | null>(null); // To store the compressed video URL
  const router = useRouter();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a video file');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.mkv'],
    },
    maxFiles: 1,
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page refresh

    if (!selectedFile || !title.trim() || !description.trim()) {
      setError('Please fill in all fields and select a video');
      return;
    }

    setUploadProgress({ started: true, progress: 0 });
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('originalSize', selectedFile.size.toString());

    try {
      const response = await fetch('/api/video-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', errorText);
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Set the URL of the compressed video
      if (result.compressedVideoUrl) {
        setCompressedVideoUrl(result.compressedVideoUrl);
      } else {
        console.error('Compression response:', result);
        setError('Video compression failed. Please try again.');
      }

      // Reset form after successful upload
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setUploadProgress({ started: false, progress: 0 });
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload video. Please try again.');
      setUploadProgress({ started: false, progress: 0 });
    }
  };

  return (
    <div className="flex min-h-screen h-screen bg-[#282a36] text-[#f8f8f2] overflow-hidden">
      <aside className="w-64 bg-[#44475a] text-[#f8f8f2] p-6">
        <h2 className="text-2xl font-bold mb-6">Menu</h2>
        <ul>
          <li className="mb-4">
            <button
              onClick={() => router.push('/social-share')}
              className="w-full text-left py-2 px-4 bg-[#6272a4] hover:bg-[#50fa7b] rounded"
            >
              Image Upload
            </button>
          </li>
          <li>
            <button
              onClick={() => router.push('/video-upload')}
              className="w-full text-left py-2 px-4 bg-[#6272a4] hover:bg-[#50fa7b] rounded"
            >
              Video Upload
            </button>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-10 overflow-auto">
        <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 shadow-lg rounded-xl">
          <form onSubmit={handleUpload} className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer 
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${error ? 'border-red-500' : ''}`}
            >
              <input {...getInputProps()} />
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isDragActive
                  ? 'Drop the video here...'
                  : 'Drag & drop a video file here, or click to select'}
              </p>
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            {uploadProgress.started && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || uploadProgress.started}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploadProgress.started ? 'Uploading...' : 'Upload Video'}
            </button>
          </form>

          {compressedVideoUrl && (
            <>
              {/* Show Download Link for Compressed Video */}
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700">Download Compressed Video</h3>
                <a
                  href={compressedVideoUrl}
                  download="compressed-video.mp4"
                  className="text-blue-600 hover:underline"
                >
                  Click here to download the compressed video
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoUpload;