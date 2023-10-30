import GraphSlider from "@/components/GraphSlider";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24 gap-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm lg:flex">
        <div>
          <p className="text-[--gray-12] fixed left-0 top-0 flex w-full justify-center pb-6 pt-8 backdrop-blur-2xl dark:from-inherit lg:static lg:w-auto  lg:rounded-xl  lg:p-4">
            Graph Slider
          </p>
        </div>

        <ThemeSwitcher />
      </div>

      <div className="flex">
        <div className="flex px-40 pb-16 pt-4 bg-[--gray-2] border-[--gray-4] border rounded-lg">
          <GraphSlider />
        </div>
      </div>
    </main>
  );
}
