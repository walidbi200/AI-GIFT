const GiftCardSkeleton = () => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-soft border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 min-w-0">
        <div className="h-5 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
        <div className="flex gap-3">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export default GiftCardSkeleton; 