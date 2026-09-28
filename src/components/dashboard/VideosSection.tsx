
import { motion } from "framer-motion";
import { ArrowUpRight, PlayCircle } from "lucide-react";

const videos = [
  {
    title: "React JS Tutorial for Beginners",
    category: "Frontend Development",
    videoId: "SqcY0GlETPk",
  },
  {
    title: "Java Tutorial for Beginners",
    category: "Programming",
    videoId: "eIrMbAQSU34",
  },
  {
    title: "Node.js Tutorial for Beginners",
    category: "Backend Development",
    videoId: "TlB_eWDSMt4",
  },
  {
    title: "Python Tutorial for Beginners",
    category: "Programming",
    videoId: "kqtD5dpn9C8",
  },
];

const VideosSection = () => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45 }}
      className="mt-12"
    >
      <div className="flex justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-secondary" />
            Recommended Videos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Learn and grow with these tutorials.
          </p>
        </div>
        <a
          href="https://www.youtube.com/results?search_query=programming+tutorials"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-secondary inline-flex items-center gap-1"
        >
          Explore YouTube <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {videos.map((video) => (
          <motion.article
            key={video.videoId}
            className="glass-card-hover overflow-hidden"
          >
            <div className="aspect-video bg-muted">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
                title={video.title}
                loading="lazy"
                allowFullScreen
              />
            </div>
            <div className="p-4">
              <p className="text-xs text-secondary mb-1">
                {video.category}
              </p>
              <h3 className="font-semibold text-primary text-sm">
                {video.title}
              </h3>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
};

export default VideosSection;
  