export type AppEvents = {
  "app/connection-request": {
    data: {
      connectionId: string;
    };
  };

  "app/story-delete": {
    data: {
      storyId: string;
    };
  }
};