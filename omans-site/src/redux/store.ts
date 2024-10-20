import { configureStore } from "@reduxjs/toolkit";
import imageReducer from "./imageSlice";

const store = configureStore({
  reducer: {
    image: imageReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
