import Modal from "@/components/SimpleModalWrapper"
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import EditCourseForm from "@/components/EditCourseForm";


export default async function EditCourseModal(
  props: {params: Promise<{ courseId: string; }>}) {

  const params = await props.params

  let course = null
  try {
    course = await prisma.course.findUniqueOrThrow({
      where: { courseId:params.courseId },
    });
  } catch {
    notFound();
  }

  return (
    <Modal title={`Edit Course ${course.courseName}`}>
      <EditCourseForm
        courseId={params.courseId}
        initialName={course.courseName}
        initialDescription={course.courseDescription ? course.courseDescription : ""}
      />
    </Modal>
  );
}