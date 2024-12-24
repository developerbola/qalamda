import Image from "next/image";
import Link from "next/link";

const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
      <Link
        href="/"
        className="flex items-center text-2xl font-semibold text-gray-900"
      >
        <Image src="/logo.svg" alt="logo" width={200} height={60} />
      </Link>
      <div className="w-full md:mt-0 sm:max-w-md xl:p-0 ">
        <div className="p-6 sm:p-8 flex flex-col gap-2">
          <form className="space-y-2 md:space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Email manzilingiz
              </label>
              <input
                type="email"
                className={`bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5`}
                placeholder="sizningemailingiz@icloud.com"
                required
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900">
                Parolingiz
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                required
              />
            </div>
            <button className="w-full bg-gray-900 text-white bg-primary-600 hover:bg-primary-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
              Sign In
            </button>
            <p className="text-sm font-light text-gray-900">
              Akkauntingiz yo`qmi?{" "}
              <a
                href="/signup"
                className="font-medium text-primary-600 underline"
              >
                SignUp
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
