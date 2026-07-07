import Spinner from "./Spinner";

const PageLoader = ({ label = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
    <Spinner size="lg" />
    <p className="text-sm">{label}</p>
  </div>
);

export default PageLoader;
