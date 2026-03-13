'use client';
import dynamic from 'next/dynamic';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

export default function VideoPlayer({ url, onProgress, onEnded }) {
    return (
        <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-lg">
            <ReactPlayer
                className="absolute top-0 left-0"
                url={url}
                width="100%"
                height="100%"
                controls
                onProgress={onProgress}
                onEnded={onEnded}
                onError={(e) => console.error("Video Error:", e)}
                config={{
                    file: {
                        attributes: {
                            controlsList: 'nodownload',
                        },
                    },
                }}
            />
        </div>
    );
}
