import Modal from "@/components/SimpleModalWrapper"
import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import EditModuleForm from "@/components/EditModuleForm";


export default async function EditModuleModal(
  props: {params: Promise<{ courseId: string; moduleIndex: string }>}) {

  const params = await props.params

  const index = parseInt(params.moduleIndex, 10);
  if (isNaN(index)) notFound();

  let courseModule = null
  try {
    courseModule = await prisma.module.findFirstOrThrow({
      where: { courseId:params.courseId, moduleIndex: index },
      include: { course: true }
    });
  } catch {
    notFound();
  }

  return (
    <Modal title={`Edit Module ${index}`}>
      <EditModuleForm
        courseId={params.courseId}
        moduleIndex={index}
        initialData={courseModule}
      />
    </Modal>
  );
}