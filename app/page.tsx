import { Articles, StartPage } from "@/sections/sections";
const HomeScreen = () => {
  return (
    <>
      <Articles />
    </>
  );
};

export default function Home() {
  const user = false;
  return (
    <>
      <div className="h-screen flex items-center justify-center">
        {user ? <HomeScreen /> : <StartPage />}
      </div>
    </>
  );
}
