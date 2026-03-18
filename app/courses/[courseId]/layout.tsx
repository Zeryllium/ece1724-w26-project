export default function CourseLayout(
  {
    children,
    modal,
  }: {
    children: React.ReactNode;
    modal: React.ReactNode;
  }
) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}