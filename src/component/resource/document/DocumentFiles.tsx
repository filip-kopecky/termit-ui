import Document from "../../../model/Document";
import TermItFile, { FileData } from "../../../model/File";
import { ThunkDispatch } from "../../../util/Types";
import { useDispatch } from "react-redux";
import {
  createFileInDocument,
  exportFileContent,
  removeFileFromDocument,
  updateResource,
  uploadFileContent,
} from "../../../action/AsyncActions";
import VocabularyUtils from "../../../util/VocabularyUtils";
import Files from "./Files";
import NotificationType from "../../../model/NotificationType";
import { publishNotification } from "../../../action/SyncActions";
import AddFile from "./AddFile";
import RemoveFile from "./RemoveFile";
import RenameFile from "./RenameFile";
import FileContentActions from "./FileContentActions";

interface DocumentFilesProps {
  document: Document;
  onFileRemoved: () => void;
  onFileRenamed: () => void;
  onFileAdded: () => void;
}

export const DocumentFiles = (props: DocumentFilesProps) => {
  const { document, onFileAdded, onFileRemoved, onFileRenamed } = props;
  const dispatch: ThunkDispatch = useDispatch();

  const createFile = (termitFile: TermItFile, file: File): Promise<void> =>
    dispatch(
      createFileInDocument(termitFile, VocabularyUtils.create(document.iri))
    )
      .then(() =>
        dispatch(
          uploadFileContent(VocabularyUtils.create(termitFile.iri), file)
        ).then(() =>
          dispatch(
            publishNotification({
              source: { type: NotificationType.FILE_CONTENT_UPLOADED },
            })
          )
        )
      )
      .then(onFileAdded);

  const deleteFile = (termitFile: TermItFile) =>
    dispatch(
      removeFileFromDocument(termitFile, VocabularyUtils.create(document.iri))
    ).then(onFileRemoved);

  const modifyFile = (termitFile: FileData) =>
    dispatch(updateResource(new TermItFile(termitFile))).then(onFileRenamed);

  const downloadFile = (termitFile: TermItFile) =>
    dispatch(exportFileContent(VocabularyUtils.create(termitFile.iri)));

  if (!document) {
    return null;
  }

  return (
    <Files
      files={document.files}
      actions={[<AddFile key="add-file" performAction={createFile} />]}
      itemActions={(file: TermItFile) => [
        <FileContentActions
          key="file-content-actions"
          file={file}
          onDownload={downloadFile}
        />,
        <RenameFile key="rename-file" file={file} performAction={modifyFile} />,
        <RemoveFile
          key="remove-file"
          file={file}
          performAction={deleteFile.bind(this, file)}
          withConfirmation={true}
        />,
      ]}
    />
  );
};

export default DocumentFiles;
