import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ImageState {
  selectedImageId: number | null;
  message: string;
}

const initialState: ImageState = {
  selectedImageId: null,
  message: "",
};

const imageSlice: any = createSlice({
  name: "image",
  initialState,
  reducers: {
    selectImage: (
      state,
      action: PayloadAction<{
        id: number;
        description: string | undefined;
        title: string;
      }>
    ) => {
      state.selectedImageId = action.payload.id;
      state.message = `Hello, I'd like to inquire about "${action.payload.title}"`;
    },
    clearSelection: (state) => {
      state.selectedImageId = null;
      state.message = "";
    },
  },
});

export const { selectImage, clearSelection } = imageSlice.actions;

export default imageSlice.reducer;
