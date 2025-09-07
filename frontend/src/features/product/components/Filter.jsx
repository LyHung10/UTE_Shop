import {useState} from "react";

export default function FilterColor() {
    const [isOpen, setIsOpen] = useState(false);
    const colors = ["White", "Beige", "Blue", "Brown", "Green", "Purple"];
    const [selectedColors, setSelectedColors] = useState(["Blue"]); // mặc định checked

    const toggleColor = (color) => {
        if (selectedColors.includes(color)) {
            setSelectedColors(selectedColors.filter((c) => c !== color));
        } else {
            setSelectedColors([...selectedColors, color]);
        }
    };

    return (
        <div className="my-3 flow-root">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500"
            >
                <span className="font-medium text-gray-900">Color</span>
                <span className="ml-6 flex items-center">
                {!isOpen ? (
                  <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 me-5">
                      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                ) : (
                  <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5 me-5">
                      <path
                          d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
                          clipRule="evenodd"
                          fillRule="evenodd"
                      />
                  </svg>
                )}
        </span>
            </button>

            {isOpen && (
                <div className="block py-6">
                    <div className="space-y-4">
                        {colors.map((color, idx) => (
                            <div key={idx} className="flex gap-3">
                                <div className="flex h-5 shrink-0 items-center">
                                    <div className="group grid grid-cols-1 size-4">
                                        <input
                                            id={`filter-color-${idx}`}
                                            type="checkbox"
                                            name="color[]"
                                            value={color.toLowerCase()}
                                            checked={selectedColors.includes(color)}
                                            onChange={() => toggleColor(color)}
                                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                        />
                                        <svg
                                            viewBox="0 0 14 14"
                                            fill="none"
                                            className="pointer-events-none col-start-1 row-start-1 w-3.5 h-3.5 self-center justify-self-center stroke-white"
                                        >
                                            <path
                                                d="M3 8L6 11L11 3.5"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className={
                                                    selectedColors.includes(color) ? "opacity-100" : "opacity-0"
                                                }
                                            />
                                            <path
                                                d="M3 7H11"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="opacity-0"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <label
                                    htmlFor={`filter-color-${idx}`}
                                    className="text-sm text-gray-600"
                                >
                                    {color}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
// <div className="border-b border-gray-200 py-6">
//     <h3 className="-my-3 flow-root">
//     <button type="button" command="--toggle" commandfor="filter-section-color"
// className="flex w-full items-center justify-between bg-white py-3 text-sm text-gray-400 hover:text-gray-500">
//     <span className="font-medium text-gray-900">Color</span>
// <span className="ml-6 flex items-center">
//                                               <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon"
//                                                    aria-hidden="true" className="size-5 in-aria-expanded:hidden">
//                                                 <path
//                                                     d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z"/>
//                                               </svg>
//                                               <svg viewBox="0 0 20 20" fill="currentColor" data-slot="icon"
//                                                    aria-hidden="true" className="size-5 not-in-aria-expanded:hidden">
//                                                 <path
//                                                     d="M4 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H4.75A.75.75 0 0 1 4 10Z"
//                                                     clipRule="evenodd" fillRule="evenodd"/>
//                                               </svg>
//                                             </span>
// </button>
// </h3>
// <el-disclosure id="filter-section-color" hidden className="block pt-6">
//     <div className="space-y-4">
//         <div className="flex gap-3">
//             <div className="flex h-5 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                     <input id="filter-color-0" type="checkbox" name="color[]" value="white"
//                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"/>
//                     <svg viewBox="0 0 14 14" fill="none"
//                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25">
//                         <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round"
//                               strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100"/>
//                         <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                               className="opacity-0 group-has-indeterminate:opacity-100"/>
//                     </svg>
//                 </div>
//             </div>
//             <label htmlFor="filter-color-0" className="text-sm text-gray-600">White</label>
//         </div>
//         <div className="flex gap-3">
//             <div className="flex h-5 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                     <input id="filter-color-1" type="checkbox" name="color[]" value="beige"
//                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"/>
//                     <svg viewBox="0 0 14 14" fill="none"
//                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25">
//                         <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round"
//                               strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100"/>
//                         <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                               className="opacity-0 group-has-indeterminate:opacity-100"/>
//                     </svg>
//                 </div>
//             </div>
//             <label htmlFor="filter-color-1" className="text-sm text-gray-600">Beige</label>
//         </div>
//         <div className="flex gap-3">
//             <div className="flex h-5 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                     <input id="filter-color-2" type="checkbox" name="color[]" value="blue" checked
//                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"/>
//                     <svg viewBox="0 0 14 14" fill="none"
//                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25">
//                         <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round"
//                               strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100"/>
//                         <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                               className="opacity-0 group-has-indeterminate:opacity-100"/>
//                     </svg>
//                 </div>
//             </div>
//             <label htmlFor="filter-color-2" className="text-sm text-gray-600">Blue</label>
//         </div>
//         <div className="flex gap-3">
//             <div className="flex h-5 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                     <input id="filter-color-3" type="checkbox" name="color[]" value="brown"
//                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"/>
//                     <svg viewBox="0 0 14 14" fill="none"
//                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25">
//                         <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round"
//                               strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100"/>
//                         <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                               className="opacity-0 group-has-indeterminate:opacity-100"/>
//                     </svg>
//                 </div>
//             </div>
//             <label htmlFor="filter-color-3" className="text-sm text-gray-600">Brown</label>
//         </div>
//         <div className="flex gap-3">
//             <div className="flex h-5 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                     <input id="filter-color-4" type="checkbox" name="color[]" value="green"
//                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"/>
//                     <svg viewBox="0 0 14 14" fill="none"
//                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25">
//                         <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round"
//                               strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100"/>
//                         <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                               className="opacity-0 group-has-indeterminate:opacity-100"/>
//                     </svg>
//                 </div>
//             </div>
//             <label htmlFor="filter-color-4" className="text-sm text-gray-600">Green</label>
//         </div>
//         <div className="flex gap-3">
//             <div className="flex h-5 shrink-0 items-center">
//                 <div className="group grid size-4 grid-cols-1">
//                     <input id="filter-color-5" type="checkbox" name="color[]" value="purple"
//                            className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"/>
//                     <svg viewBox="0 0 14 14" fill="none"
//                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25">
//                         <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round"
//                               strokeLinejoin="round" className="opacity-0 group-has-checked:opacity-100"/>
//                         <path d="M3 7H11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
//                               className="opacity-0 group-has-indeterminate:opacity-100"/>
//                     </svg>
//                 </div>
//             </div>
//             <label htmlFor="filter-color-5" className="text-sm text-gray-600">Purple</label>
//         </div>
//     </div>
// </el-disclosure>
// </div>