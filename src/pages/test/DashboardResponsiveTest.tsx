import React from 'react';
import { ResponsiveTest } from '../../components/test/ResponsiveTest';
import { Dashboard } from '../Dashboard';

export const DashboardResponsiveTest: React.FC = () => {
  return (
    <ResponsiveTest>
      <Dashboard />
    </ResponsiveTest>
  );
};

// Test checklist for responsive dashboard
export const ResponsiveChecklist = () => {
  const checklistItems = [
    {
      category: 'Layout Structure',
      items: [
        'Dashboard grid adapts from single column (mobile) to multi-column (desktop)',
        'Sidebar collapses appropriately on mobile devices',
        'Main content area adjusts width based on screen size',
        'Cards stack vertically on mobile, arrange in grid on larger screens'
      ]
    },
    {
      category: 'Navigation & Tabs',
      items: [
        'Tab navigation scrolls horizontally on mobile',
        'Tab buttons are touch-friendly (minimum 44px height)',
        'Active tab states are clearly visible on all screen sizes',
        'Navigation doesn\'t break on narrow screens'
      ]
    },
    {
      category: 'Cards & Components',
      items: [
        'Job cards adapt layout from vertical (mobile) to horizontal (desktop)',
        'Button sizes adjust appropriately for touch vs mouse interaction',
        'Text sizes scale appropriately (responsive typography)',
        'Icons and images maintain proper proportions'
      ]
    },
    {
      category: 'Content & Text',
      items: [
        'Long text truncates properly on narrow screens',
        'Skills tags wrap appropriately and show "+X more" when needed',
        'Job descriptions are readable at all screen sizes',
        'Button text adapts (full text on desktop, abbreviated on mobile)'
      ]
    },
    {
      category: 'Modals & Overlays',
      items: [
        'Modals are properly sized for mobile screens',
        'Modal content scrolls when needed',
        'Close buttons are easily accessible on touch devices',
        'Form elements are appropriately sized for mobile input'
      ]
    },
    {
      category: 'Performance & UX',
      items: [
        'No horizontal scrolling on any screen size',
        'Touch targets meet accessibility guidelines (44px minimum)',
        'Loading states work well on all devices',
        'Animations and transitions perform smoothly'
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard Responsive Testing Checklist</h2>
      
      <div className="space-y-6">
        {checklistItems.map((category, categoryIndex) => (
          <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">{category.category}</h3>
            <div className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <label key={itemIndex} className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Use the viewport controls above to test different screen sizes</li>
          <li>Check each item in the checklist as you verify it works correctly</li>
          <li>Pay special attention to touch interactions on mobile viewport</li>
          <li>Test modal interactions at each screen size</li>
          <li>Verify that no content is cut off or inaccessible</li>
          <li>Check that all interactive elements are easily tappable on mobile</li>
        </ol>
      </div>
    </div>
  );
};
