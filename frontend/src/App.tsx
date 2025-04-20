import URLInput from "./components/url_input";

export default function App() {
  return (
    <div className="m-auto flex flex-col justify-between p-4 pt-32 min-h-[100dvh] max-w-2xl">
      <URLInput />
      <div className="mt-4 text-xs text-center">
        <a href="https://github.com/lalitshankarchowdhury" target="_blank">
          Made with ❤️ by <span className="underline">Lalit Shankar Chowdhury</span>
        </a>
      </div>
    </div>
  );
}
