import { Image, SimpleGrid, Text } from "@mantine/core";
import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { IconUpload } from "@tabler/icons-react";
import { useEffect, useState } from "react";

function ImageDrop(props: { setImgValue: (arg0: FileWithPath[]) => void }) {
  const [files, setFiles] = useState<FileWithPath[]>([]);

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <Image
        key={index}
        src={imageUrl}
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
        alt="Profile"
      />
    );
  });

  useEffect(() => {
    props.setImgValue(files);
  });

  return (
    <div className="flex-1">
      <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles} color="#961699">
        <div className="flex items-center justify-center mb-5">
          <IconUpload stroke={1} />{" "}
          <span className="ml-2 font-bold text-[13px]">Upload</span>
        </div>

        <Text align="center" color="#425466" className="text-[13px]">
          PNG or JPG no bigger than 1000px wide and tall.
        </Text>
      </Dropzone>

      <SimpleGrid
        cols={4}
        breakpoints={[{ maxWidth: "sm", cols: 1 }]}
        mt={previews.length > 0 ? "xl" : 0}
      >
        {previews}
      </SimpleGrid>
    </div>
  );
}

export default ImageDrop;
