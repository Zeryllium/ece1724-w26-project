import CreateCourseForm from "@/components/CreateCourseForm";
import Modal from "@/components/SimpleModalWrapper";

export default async function NewModulePage(props: { params: Promise<{ courseId: string }> }) {
  const {courseId} = await props.params
  return (
    <Modal title={"Create new module"}>
      <CreateCourseForm/>
    </Modal>
  );
}