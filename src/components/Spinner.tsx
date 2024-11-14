import { Loader } from "@mantine/core";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh_-_200px)]">
      <Loader size="lg" color="#961699" />
    </div>
  );
};
export default Spinner;
