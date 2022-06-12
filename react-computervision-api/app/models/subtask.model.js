module.exports = mongoose => {
    const SubTask = mongoose.model(
      "subtask",
      mongoose.Schema(
        {
            taskId: String,
            title: String,
            completed: Boolean
        },
        { timestamps: true }
      )
    );
  
    return SubTask;
};