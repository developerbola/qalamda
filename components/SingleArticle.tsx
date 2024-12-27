import Image from "next/image";

const SingleArticle: React.FC<SingleArticleProps> = ({ article }) => {
  return (
    <a href={`/articles/${article._id}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="max-w-[60%] flex flex-col gap-3">
            <h1 className="text-3xl font-semibold">{article.title}</h1>
            <p className="line-clamp-3">{article.description}</p>
          </div>
          <div>
            <Image
              src={article.image}
              alt={article.title}
              className="w-[300px] h-[150px] object-cover"
              width={300}
              height={400}
            />
          </div>
        </div>
      </div>
    </a>
  );
};

export default SingleArticle;
