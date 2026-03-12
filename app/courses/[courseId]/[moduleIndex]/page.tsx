
export default async function (props: PageProps<"/courses/[courseId]/[moduleIndex]">) {
  // Module Index rather than Module Id because Module Id is non-sequential, but Module Index is.
  const { courseId, moduleIndex } = await props.params;
  return (
    <div>
      <h1>TODO: Module Page for Module number {moduleIndex} in Course {courseId}</h1>
    </div>
  )
}