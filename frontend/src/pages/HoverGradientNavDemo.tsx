import HoverGradientNavBar from "@/components/ui/hover-gradient-nav-bar";

export default function HoverGradientNavDemo() {
  return (
    <div className="min-h-[120vh] bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
      {/* Page content spacer so you can scroll and see the fixed nav bar */}
      <div className="max-w-3xl mx-auto pt-16 pb-28 px-4 md:px-6">
        <h1 className="text-2xl md:text-3xl font-semibold mb-3 text-gray-900 dark:text-white">Hover Gradient Nav Bar</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Move your mouse over the items to see the 3D flip and glow animation. This demo page is intentionally tall so the fixed navigation bar at the bottom is visible at all times.
        </p>

        <div className="grid gap-4">
          <div className="card">
            <h2 className="font-medium mb-2">Example Content Card</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Use this area to verify the component overlays correctly and the blur/contrast works with your theme.
            </p>
          </div>
          <div className="card">
            <h2 className="font-medium mb-2">Another Card</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The bar is fixed to the bottom on mobile and centered on larger screens.
            </p>
          </div>
        </div>
      </div>

      <HoverGradientNavBar />
    </div>
  );
}
