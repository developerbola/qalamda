import SingleArticle from "./SingleArticle";

const ArticlesSection = () => {
  const articles = [
    {
      _id: "dg726g238",
      title: "New feature of Javascript",
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iusto hic ipsum maxime quia aliquam, numquam ut labore? Beatae, fugiat laudantium.",
      image:
        "https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      tags: ["Javascript", "Coding"],
    },
    {
      _id: "hwehj90d1",
      title: "React 19 Best practice",
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil maxime ex necessitatibus iusto ipsum cumque quod alias eaque veniam omnis veritatis ipsam aut, obcaecati vel blanditiis doloremque qui, voluptatibus autem?",
      image: "/og-image.png",
      tags: ["ReactJS", "Coding"],
    },
  ];
  return (
    <div className="h-full py-2 flex flex-col gap-2">
      {articles.map((article) => {
        return <SingleArticle article={article} key={article._id} />;
      })}
    </div>
  );
};

export default ArticlesSection;
