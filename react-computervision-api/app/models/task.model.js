module.exports = mongoose => {
    const Task = mongoose.model(
      "task",
      mongoose.Schema(
        {
          title: String,
          dueDate: Date,
          description: String,
          completed: Boolean
        },
        { timestamps: true }
      )
    );
  
    return Task;
};