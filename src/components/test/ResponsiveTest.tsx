import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Maximize } from 'lucide-react';

interface ResponsiveTestProps {
  children: React.ReactNode;
}

export const ResponsiveTest: React.FC<ResponsiveTestProps> = ({ children }) => {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop' | 'full'>('full');

  const getViewportStyles = () => {
    switch (viewportSize) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '1024px', height: '768px' };
      default:
        return { width: '100%', height: '100%' };
    }
  };

  const getContainerClass = () => {
    if (viewportSize === 'full') return 'w-full h-full';
    return 'mx-auto border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Controls */}
      <div className="mb-4 flex gap-2 justify-center">
        <button
          onClick={() => setViewportSize('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            viewportSize === 'mobile'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          Mobile (375px)
        </button>
        <button
          onClick={() => setViewportSize('tablet')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            viewportSize === 'tablet'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Tablet className="w-4 h-4" />
          Tablet (768px)
        </button>
        <button
          onClick={() => setViewportSize('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            viewportSize === 'desktop'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Monitor className="w-4 h-4" />
          Desktop (1024px)
        </button>
        <button
          onClick={() => setViewportSize('full')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            viewportSize === 'full'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Maximize className="w-4 h-4" />
          Full Screen
        </button>
      </div>

      {/* Viewport Info */}
      <div className="mb-4 text-center text-sm text-gray-600">
        Current viewport: {viewportSize} 
        {viewportSize !== 'full' && (
          <span className="ml-2">
            ({getViewportStyles().width} × {getViewportStyles().height})
          </span>
        )}
      </div>

      {/* Test Container */}
      <div className={getContainerClass()} style={getViewportStyles()}>
        <div className="w-full h-full overflow-auto">
          {children}
        </div>
      </div>

      {/* Responsive Guidelines */}
      <div className="mt-8 max-w-4xl mx-auto bg-white rounded-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Responsive Design Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Mobile (320px - 767px)</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Single column layout</li>
              <li>• Stacked navigation</li>
              <li>• Touch-friendly buttons</li>
              <li>• Condensed content</li>
            </ul>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Tablet (768px - 1023px)</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Two column layout</li>
              <li>• Horizontal navigation</li>
              <li>• Medium-sized elements</li>
              <li>• Balanced spacing</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Desktop (1024px+)</h4>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Multi-column layout</li>
              <li>• Full navigation</li>
              <li>• Larger elements</li>
              <li>• Generous spacing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
