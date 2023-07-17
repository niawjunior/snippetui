export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
        <div className="absolute w-full z-10 flex justify-center items-center min-h-[90vh]">
            <div className="relative inline-flex">
                <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full absolute top-0 left-0 animate-ping"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full absolute top-0 left-0 animate-pulse"></div>
            </div>
        </div>

    )
}