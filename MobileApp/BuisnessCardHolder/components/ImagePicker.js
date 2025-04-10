import { launchImageLibrary } from 'react-native-image-picker';
import { apiHost } from '../ApiConfig';
import ImgToBase64 from 'react-native-image-base64';
import ImageResizer from "@bam.tech/react-native-image-resizer"

const OpenImagePicker = (setImage, bUri) => {
    const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 2000,
        maxWidth: 2000,
    }
   
    launchImageLibrary(options, (response) => {
        if (response.didCancel) return;
        
        let imageUri = response.assets?.[0]?.uri;
        let rotation = 0;
        
        if (response.assets?.[0]?.originalRotation === 90) rotation = 90;
        else if (response.assets?.[0]?.originalRotation === 270) rotation = -90;

        ImageResizer.createResizedImage( imageUri, response.assets?.[0]?.width, response.assets?.[0]?.height, "JPEG", 100, rotation ).
        then(( { uri }) => {
            if (bUri) {
                setImage(uri);
            } else {
                setImage(`data:image/png;base64,${response.assets?.[0]?.base64}`);
            }
        })
        
    })
}

export default OpenImagePicker;

export const getValidAvatarUri = (image) => {
    if (!image) {
        return '';
    }
    if (image.startsWith('https') || image.startsWith('data:image')) {
        return image;
    } else {
        return `${apiHost}/${image}`;
    }
}