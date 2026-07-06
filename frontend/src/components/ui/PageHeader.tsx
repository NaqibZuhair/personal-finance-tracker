type PageHeaderProps = {
  title: string;
  description: string;
};

function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  );
}

export default PageHeader;