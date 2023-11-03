import GraphSliderV2 from "@/components/GraphSliderV2";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function HomeV2() {
  return (
    <main className="flex flex-col items-center p-12 md:p-24 gap-20 md:gap-24 overflow-hidden">
      <div className="z-10 max-w-5xl w-full justify-between text-sm flex">
        <p className="text-[--gray-12] flex w-full pb-2 md:pb-6 pt-2 md:pt-8">
          Graph Slider
        </p>

        <ThemeSwitcher />
      </div>

      <div className="flex md:px-40 px-2 md:pb-16 pb-8 md:pt-4 pt-0 bg-[--gray-2] border-[--gray-4] border rounded-lg [&>*]:select-none">
        <GraphSliderV2 />
      </div>
    </main>
  );
}
