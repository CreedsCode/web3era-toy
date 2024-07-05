const bigIntSerializer = (key: string, value: any) => {
  console.log("AAAAAA");
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
};

export default bigIntSerializer;
