
export default async function(props: PageProps<"/courses/[courseId]">) {
  const { courseId } = await props.params;
  return (
    <div>
      <h1>TODO: Course Page for Course number {courseId}</h1>
    </div>
  )
}